import React, { useState, useRef, useEffect, useCallback } from "react";

export default function LiveCodeRunner({
  code = "<?php\n// Example\n$greeting = \"Hello, world!\";\necho \"<h1>$greeting</h1>\";\n?>",
  timeoutMs = 30000,
}) {
  const [src, setSrc] = useState(code);
  const [output, setOutput] = useState("");
  const [isHtmlOutput, setIsHtmlOutput] = useState(false);
  const [status, setStatus] = useState("idle");
  const [lastError, setLastError] = useState(null);
  const iframeRef = useRef(null);
  const workerRef = useRef(null);
  const runIdRef = useRef(0);
  const textareaRef = useRef(null);
  const isWorkerReady = useRef(false);
  const pendingExecutions = useRef(new Map());

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [src]);

  const handleWorkerMessage = useCallback((msg) => {
    const runId = msg.id || msg.runId;
    
    if (!runId || !pendingExecutions.current.has(runId)) {
      return;
    }

    const execution = pendingExecutions.current.get(runId);
    
    if (msg.type === 'result' || msg.type === 'output' || msg.output !== undefined) {
      clearTimeout(execution.timeoutId);
      pendingExecutions.current.delete(runId);

      let result = '';
      if (msg.output !== undefined) {
        result = String(msg.output);
      } else if (msg.result !== undefined) {
        result = String(msg.result);
      } else if (msg.stdout !== undefined) {
        result = String(msg.stdout);
        if (msg.stderr) {
          result += '\n' + String(msg.stderr);
        }
      } else {
        result = JSON.stringify(msg);
      }

      const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(result);
      setIsHtmlOutput(looksLikeHtml);
      setOutput(result);

      if (looksLikeHtml && iframeRef.current) {
        try {
          const doc = iframeRef.current.contentDocument;
          if (doc) {
            doc.open();
            doc.write(result);
            doc.close();
          }
        } catch (e) {
          console.warn('Failed to update iframe:', e);
        }
      }

      setStatus("idle");

    } else if (msg.type === 'error' || msg.error) {
      clearTimeout(execution.timeoutId);
      pendingExecutions.current.delete(runId);

      const errorMsg = msg.error || msg.message || 'Unknown error';
      setStatus("error");
      setLastError(errorMsg);
      setOutput("[Error] " + errorMsg);
    }
  }, []);

  const createPHPWorker = useCallback(() => {
    const workerCode = `
      let phpInstance = null;
      
      const CDN_SOURCES = [
        'https://cdn.jsdelivr.net/npm/php-wasm@latest/dist/php-wasm.js',
        'https://unpkg.com/php-wasm@latest/dist/php-wasm.js',
        'https://cdn.skypack.dev/php-wasm@latest'
      ];
      
      async function loadPHPWithFallback() {
        for (const cdn of CDN_SOURCES) {
          try {
            const module = await import(cdn);
            const PhpWeb = module.PhpWeb || module.default?.PhpWeb || module.default;
            
            if (!PhpWeb) {
              throw new Error('PhpWeb not found in module');
            }
            
            phpInstance = new PhpWeb();
            
            // Try different initialization methods
            if (phpInstance.init) {
              await phpInstance.init();
            } else if (phpInstance.php?.init) {
              await phpInstance.php.init();
            } else if (typeof phpInstance.ready === 'function') {
              await phpInstance.ready();
            }
            
            return phpInstance;
          } catch (error) {
            console.warn('Failed to load from', cdn, ':', error.message);
            continue;
          }
        }
        throw new Error('All PHP-WASM CDN sources failed to load');
      }
      
      async function executePHP(code) {
        if (!phpInstance) {
          await loadPHPWithFallback();
        }
        
        // Try different execution methods
        if (phpInstance.run) {
          return phpInstance.run(code);
        } else if (phpInstance.php?.run) {
          return phpInstance.php.run(code);
        } else if (phpInstance.exec) {
          return phpInstance.exec(code);
        } else if (phpInstance.php?.exec) {
          return phpInstance.php.exec(code);
        }
        
        throw new Error('No valid PHP execution method found');
      }
      
      self.onmessage = async function(e) {
        const { type, code, id } = e.data;
        
        if (type === 'ping') {
          try {
            await loadPHPWithFallback();
            self.postMessage({ type: 'ready', ready: true });
          } catch (error) {
            self.postMessage({ 
              type: 'error', 
              error: 'PHP initialization failed: ' + error.message 
            });
          }
          return;
        }
        
        if (type === 'run') {
          try {
            const result = await executePHP(code);
            
            self.postMessage({
              type: 'result',
              output: String(result || ''),
              id: id
            });
          } catch (error) {
            self.postMessage({
              type: 'error',
              error: error.message || 'PHP execution failed',
              id: id
            });
          }
        }
      };
      
      self.onerror = function(error) {
        self.postMessage({
          type: 'error',
          error: 'Worker error: ' + error.message
        });
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob), { type: 'module' });
  }, []);

  const initializeWorker = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (workerRef.current && isWorkerReady.current) {
        resolve(workerRef.current);
        return;
      }

      if (workerRef.current) {
        try {
          workerRef.current.terminate();
        } catch (e) {}
        workerRef.current = null;
        isWorkerReady.current = false;
      }

      try {
        const worker = createPHPWorker();
        workerRef.current = worker;

        const initTimeout = setTimeout(() => {
          reject(new Error('Worker initialization timeout'));
        }, 10000);

        worker.onmessage = (e) => {
          const msg = e.data;
          
          if (msg.type === 'ready' || msg.ready === true) {
            clearTimeout(initTimeout);
            isWorkerReady.current = true;
            resolve(worker);
            return;
          }

          handleWorkerMessage(msg);
        };

        worker.onerror = (error) => {
          clearTimeout(initTimeout);
          console.error('Worker error:', error);
          isWorkerReady.current = false;
          reject(error);
        };

        worker.postMessage({ type: 'ping' });

      } catch (error) {
        console.error('Worker creation error:', error);
        reject(error);
      }
    });
  }, [handleWorkerMessage, createPHPWorker]);

  useEffect(() => {
    initializeWorker().catch(console.error);

    return () => {
      const currentWorker = workerRef.current;
      const currentExecutions = pendingExecutions.current;

      if (currentWorker) {
        try {
          currentWorker.terminate();
        } catch (e) {}
        workerRef.current = null;
        isWorkerReady.current = false;
      }

      if (currentExecutions) {
        currentExecutions.forEach(({ timeoutId }) => {
          clearTimeout(timeoutId);
        });
        currentExecutions.clear();
      }
    };
  }, [initializeWorker]);

  const runCode = useCallback(async () => {
    setLastError(null);
    setIsHtmlOutput(false);
    setOutput("");
    setStatus("loading");

    try {
      const worker = await initializeWorker();
      
      if (!worker || !isWorkerReady.current) {
        throw new Error('Worker not ready');
      }

      setStatus("running");
      
      const runId = ++runIdRef.current;

      const timeoutId = setTimeout(() => {
        if (pendingExecutions.current.has(runId)) {
          pendingExecutions.current.delete(runId);
          setStatus("timeout");
          setLastError("Execution timeout after " + timeoutMs + " ms");
          setOutput("[Error] Execution timeout");
        }
      }, timeoutMs);

      pendingExecutions.current.set(runId, { timeoutId });

      worker.postMessage({
        type: 'run',
        code: src,
        id: runId
      });

    } catch (error) {
      console.error('Execution error:', error);
      setStatus("error");
      setLastError(error.message);
      setOutput("[Error] " + error.message);
    }
  }, [src, timeoutMs, initializeWorker]);

  const stopExecution = useCallback(() => {
    pendingExecutions.current.forEach(({ timeoutId }) => {
      clearTimeout(timeoutId);
    });
    pendingExecutions.current.clear();
    
    setStatus("stopped");
    setOutput("[Execution stopped]");
  }, []);

  const resetCode = useCallback(() => {
    setSrc(code);
    setOutput("");
    setStatus("idle");
    setLastError(null);
  }, [code]);

  const clearOutput = useCallback(() => {
    setOutput("");
    setLastError(null);
  }, []);

  const lineNumbers = React.useMemo(() => {
    const lineCount = src ? src.split("\n").length : 1;
    return Array.from({ length: lineCount }, (_, i) => i + 1).join("\n");
  }, [src]);

  return (
    <div style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial', marginTop: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{
          background: "#f1f3f5",
          color: "#495057",
          padding: '8px 6px',
          borderRadius: 6,
          overflow: 'hidden',
          width: '5ch',
          textAlign: 'right',
          lineHeight: '1.45',
          whiteSpace: 'pre',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace',
          fontSize: 12,
          userSelect: 'none'
        }}>
          {lineNumbers}
        </div>
        <textarea
          ref={textareaRef}
          value={src}
          onChange={(e) => setSrc(e.target.value)}
          spellCheck={false}
          style={{
            flex: 1,
            minHeight: 160,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace',
            fontSize: 13,
            padding: 8,
            borderRadius: 6,
            border: '1px solid #e5e7eb',
            background: "#f8f9fa",
            color: "#212529",
            lineHeight: '1.45',
            resize: "none",
            overflow: "hidden",
            fontWeight: 'bold',
          }}
        />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button
          onClick={runCode}
          disabled={status === "running" || status === "loading"}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "none",
            background: status === "running" || status === "loading" ? "#9ca3af" : "#2563eb",
            color: "white",
            cursor: status === "running" || status === "loading" ? "not-allowed" : "pointer",
          }}
        >
          {status === "loading"
            ? "Loading…"
            : status === "running"
            ? "Running…"
            : "Run PHP"}
        </button>

        <button
          onClick={stopExecution}
          disabled={pendingExecutions.current.size === 0}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #e5e7eb",
            background: "white",
            cursor: pendingExecutions.current.size > 0 ? "pointer" : "not-allowed",
            opacity: pendingExecutions.current.size > 0 ? 1 : 0.5,
          }}
        >
          Stop
        </button>

        <button
          onClick={clearOutput}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #e5e7eb",
            background: "white",
            cursor: "pointer",
          }}
        >
          Clear Output
        </button>

        <button
          onClick={resetCode}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #e5e7eb",
            background: "white",
            cursor: "pointer",
            marginLeft: "auto",
          }}
        >
          Reset Code
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 13, color: "#374151" }}>
          Status: <strong>{status}</strong>{" "}
          <span style={{ color: isWorkerReady.current ? "#16a34a" : "#dc2626", fontSize: 12 }}>
            (Worker: {isWorkerReady.current ? "Ready" : "Not Ready"})
          </span>
          {lastError ? (
            <span style={{ color: "#dc2626" }}> — {String(lastError)}</span>
          ) : null}
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 6,
          padding: 10,
          minHeight: 80,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Output</div>
        {isHtmlOutput ? (
          <iframe
            ref={iframeRef}
            title="php-preview"
            sandbox="allow-scripts"
            style={{
              width: "100%",
              minHeight: 180,
              border: "1px solid #e5e7eb",
              borderRadius: 6,
            }}
            srcDoc={output}
          />
        ) : (
          <pre
            style={{
              whiteSpace: "pre-wrap",
              fontFamily: "ui-monospace, monospace",
              fontSize: 13,
              margin: 0,
            }}
          >
            {output || (status === "idle" ? "Ready to execute PHP code..." : "")}
          </pre>
        )}
      </div>
    </div>
  );
}
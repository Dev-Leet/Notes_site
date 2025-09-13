import React, { useState, useRef, useEffect } from "react";

export default function LiveCodeRunner({
  code = "<?php\n// Example\n$greeting = \"Hello, world!\";\necho \"<h1>$greeting</h1>\";\n?>",
  timeoutMs = 8000, // client-side timeout
  workerCdn = "/php-wasm/php-worker.mjs" // UMD bundle expected
}) {
  const [src, setSrc] = useState(code);
  const [output, setOutput] = useState("");
  const [isHtmlOutput, setIsHtmlOutput] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | running | stopped | timeout | error
  const [lastError, setLastError] = useState(null);
  const iframeRef = useRef(null);
  const workerRef = useRef(null);
  const runIdRef = useRef(0);
  const textareaRef = useRef(null);

  // Build worker script as a Blob URL
  const workerBlobUrlRef = useRef(null);
  useEffect(() => {
    // Create the absolute URL in the main thread where window.location is available.
    const absoluteUrl = new URL(workerCdn, window.location.origin).href;

    const WORKER_SCRIPT = `
    let phpRuntime = null;

    // HIGHLIGHT START: Added debug message posting function
    function postDbg(msg) {
        // This sends a 'debug' message back to the main thread.
        self.postMessage({ type: 'debug', msg: '[php-worker-debug] ' + msg });
    }
    // HIGHLIGHT END

    // This function now expects a full, absolute URL.
    async function createRuntime(absoluteWorkerUrl) {
      if (phpRuntime) {
        postDbg('Runtime already initialized.');
        return phpRuntime;
      }
      
      const TRIES = [absoluteWorkerUrl, absoluteWorkerUrl.replace('.mjs', '.js')];
      for(const url of TRIES){
        try {
            postDbg('Attempting to import runtime from: ' + url);
            const { createPHP } = await import(url);
            if (createPHP) {
                postDbg('createPHP function found. Initializing runtime...');
                phpRuntime = await createPHP();
                postDbg('PHP runtime initialized successfully.');
                return phpRuntime;
            }
        } catch(e) {
            postDbg('Failed to import ' + url + ': ' + (e.message || e));
        }
      }
      throw new Error('Could not load php-wasm runtime from ' + TRIES.join(' or '));
    }

    self.onmessage = async (ev) => {
        const msg = ev.data || {};
        const { type, id, code } = msg;

        if (type === 'run') {
            try {
                // Pass the absolute URL to the create function.
                const php = await createRuntime("${absoluteUrl}");
                postDbg('Executing PHP code...');
                const result = await php.run(code);
                postDbg('Execution finished.');
                let normalized = '';
                if (result.stdout || result.stderr) {
                    normalized = (result.stdout || '') + (result.stderr ? '\\n' + result.stderr : '');
                } else {
                    normalized = String(result);
                }
                self.postMessage({ type: 'result', id, result: normalized });
            } catch (err) {
                postDbg('An error occurred: ' + (err.message || err));
                self.postMessage({ type: 'error', id, error: err.message });
            }
        }
    };
    `;
    const blob = new Blob([WORKER_SCRIPT], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    workerBlobUrlRef.current = url;
    return () => {
      if (workerBlobUrlRef.current) {
        URL.revokeObjectURL(workerBlobUrlRef.current);
        workerBlobUrlRef.current = null;
      }
    };
  }, [workerCdn]);

  // Auto-resize textarea height to fit content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [src]);


  // Helper: create a fresh worker instance (per-run) and run code, with client-side timeout and stop control
  const runWithWorker = (codeToRun, opts = {}) => {
    return new Promise((resolve, reject) => {
      if (!workerBlobUrlRef.current) {
        reject(new Error("Worker blob not initialized"));
        return;
      }
      const worker = new Worker(workerBlobUrlRef.current);
      workerRef.current = worker;
      const id = ++runIdRef.current;
      let finished = false;

      const cleanup = () => {
        try {
          worker.terminate();
        } catch (e) {}
        if (workerRef.current === worker) workerRef.current = null;
      };

      worker.onmessage = (ev) => {
        const msg = ev.data || {};
        if (msg.id && msg.id !== id && msg.type !== 'debug') return;

        // HIGHLIGHT START: Added handler for 'debug' messages
        if (msg.type === 'debug') {
            console.debug(msg.msg);
            return;
        }
        // HIGHLIGHT END
        
        if (msg.type === "result") {
          finished = true;
          cleanup();
          resolve({ result: String(msg.result || "") });
        } else if (msg.type === "error") {
          finished = true;
          cleanup();
          reject(new Error(String(msg.error || "Unknown error from worker")));
        } else if (msg.type === "stopped") {
          finished = true;
          cleanup();
          reject(new Error("Execution stopped"));
        }
      };

      worker.onerror = (err) => {
        finished = true;
        cleanup();
        reject(new Error(err.message || "Worker runtime error"));
      };

      const clientTimeout = typeof opts.timeoutMs === "number" ? opts.timeoutMs : timeoutMs;
      const t = setTimeout(() => {
        if (!finished) {
          finished = true;
          try { worker.terminate(); } catch (e) {}
          if (workerRef.current === worker) workerRef.current = null;
          reject(new Error("Client-side timeout after " + clientTimeout + " ms"));
        }
      }, clientTimeout);

      try {
        worker.postMessage({ type: "run", id, code: codeToRun, timeoutMs: clientTimeout });
      } catch (e) {
        clearTimeout(t);
        cleanup();
        reject(e);
      }
    });
  };

  // Run handler
  const runCode = async () => {
    setLastError(null);
    setIsHtmlOutput(false);
    setOutput("");
    setStatus("loading");
    try {
      setStatus("running");
      const res = await runWithWorker(src, { timeoutMs });
      const result = res.result || "";
      const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(result);

      setIsHtmlOutput(looksLikeHtml);
      setOutput(result);

      if (looksLikeHtml && iframeRef.current) {
        try {
          const doc = iframeRef.current.contentDocument;
          doc.open();
          doc.write(result);
          doc.close();
        } catch (e) {}
      }
      setStatus("idle");
    } catch (err) {
      setStatus(err.message && err.message.toLowerCase().includes("timeout") ? "timeout" : "error");
      setLastError(err.message ? String(err.message) : String(err));
      setOutput("[Error] " + (err.message || String(err)));
    }
  };

  // Stop handler: terminate running worker if any
  const stopExecution = () => {
    if (workerRef.current) {
      try {
        workerRef.current.terminate();
      } catch (e) {}
      workerRef.current = null;
      setStatus("stopped");
      setOutput("[Execution stopped]");
    }
  };

  const resetCode = () => {
    setSrc(code);
    setOutput("");
    setStatus("idle");
    setLastError(null);
  };

  const lineCount = src ? src.split("\n").length : 1;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join("\n");

  return (
    <div style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial', marginTop: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{
          background: "#f1f3f5",
          color: "#495057" ,
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
            background: "#2563eb",
            color: "white",
            cursor: "pointer",
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
          disabled={!workerRef.current}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #e5e7eb",
            background: "white",
            cursor: "pointer",
          }}
        >
          Stop
        </button>

        <button
          onClick={() => {
            setOutput("");
            setLastError(null);
          }}
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
            }}
          >
            {output}
          </pre>
        )}
      </div>
    </div>
  );

}

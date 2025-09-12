import React, { useState, useEffect } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism.css";

export default function LiveCodeRunner({ code }) {
    const [src, setSrc] = useState(code || "");
    const [output, setOutput] = useState("");
    const [isLoadingRuntime, setIsLoadingRuntime] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [php, setPhp] = useState(null); // php-wasm instance
    const [error, setError] = useState(null);
    const [timedOut, setTimedOut] = useState(false);
    const abortRef = React.useRef(false);
    const iframeRef = React.useRef(null);

    // Syntax highlight when source changes (your App already imports Prism)
    useEffect(() => {
      try {
        Prism.highlightAll();
      } catch (e) {
        // ignore highlight errors
        // console.warn("Prism highlight failed", e);
      }
    }, [src, isLoadingRuntime]);

    // Lazy-load php-wasm when requested
    const loadRuntime = async () => {
      if (php || isLoadingRuntime) return;
      setIsLoadingRuntime(true);
      setError(null);
      try {
        // Dynamic import so the package only downloads when needed
        const mod = await import("php-wasm");
        // module shape differs between builds — try common names
        const createPHP =
          (mod && (mod.default || mod.createPHP || mod.createPhp || mod.createPhpRuntime)) ||
          mod;
        if (typeof createPHP !== "function") {
          throw new Error("php-wasm: unexpected module shape — check package exports");
        }
        // create the runtime (options vary by package; this is the common pattern)
        const phpInstance = await createPHP();
        setPhp(phpInstance);
      } catch (e) {
        console.error("Failed to load php-wasm:", e);
        setError(
          "Failed to load php-wasm runtime. Make sure `php-wasm` is installed (npm i php-wasm)."
        );
      } finally {
        setIsLoadingRuntime(false);
      }
    };

    // Utility: decide if output looks like HTML (simple heuristic)
    const looksLikeHTML = (text) => {
      if (!text || typeof text !== "string") return false;
      return /<\/?[a-z][\s\S]*>/i.test(text);
    };

    // Escape plain text for <pre>
    const escapeHtml = (s) =>
      (s || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Run php code with a best-effort timeout
    const runCode = async (opts = { timeoutMs: 6000 }) => {
      setError(null);
      setTimedOut(false);
      abortRef.current = false;
      setOutput("");
      setIsRunning(true);

      // Load runtime if needed
      if (!php) {
        await loadRuntime();
      }
      if (!php) {
        setIsRunning(false);
        return;
      }

      // Normalize code: if user typed only HTML, wrap? We'll just send the src as-is.
      const codeToRun = src;

      // Promise that runs the PHP code
      const runPromise = (async () => {
        try {
          // Most php-wasm variants provide a `.run` or `.execute` method — try common names:
          const runner = php.run || php.execute || php.exec;
          if (typeof runner !== "function") {
            // some builds expose execString or similar — attempt a few fallbacks
            if (typeof php.runString === "function") {
              return await php.runString(codeToRun);
            }
            throw new Error("php-wasm runtime does not expose a run() function.");
          }
          // run the code — some runtimes return stdout string, some an object
          const result = await runner.call(php, codeToRun);
          // Normalize result to string
          if (result == null) return "";
          if (typeof result === "string") return result;
          // result may be an object { stdout, stderr }
          if (typeof result === "object") {
            if (result.stdout || result.stderr) {
              // combine stdout + stderr (stdout first)
              return `${result.stdout || ""}${result.stderr ? ("\n" + result.stderr) : ""}`.trim();
            }
            // fallback stringify
            return String(result);
          }
          return String(result);
        } catch (err) {
          // propagate
          throw err;
        }
      })();

      // Timeout wrapper
      const timeoutMs = opts.timeoutMs || 6000;
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => {
          reject(new Error(`Execution timed out after ${timeoutMs} ms`));
        }, timeoutMs)
      );

      try {
        const res = await Promise.race([runPromise, timeoutPromise]);
        if (abortRef.current) {
          setOutput("[Execution stopped by user]");
        } else {
          setOutput(res == null ? "" : String(res));
        }
      } catch (err) {
        if (err && /timed out/i.test(err.message || "")) {
          setTimedOut(true);
          setOutput("[Execution timed out]");
        } else if (abortRef.current) {
          setOutput("[Execution stopped by user]");
        } else {
          console.error("Runtime error:", err);
          setError(String(err.message || err));
          setOutput("[Execution error — see console]");
        }
      } finally {
        setIsRunning(false);
      }
    };

    const stopExecution = () => {
      // We cannot robustly kill a wasm thread from the main thread in all runtimes.
      // Best-effort: set a flag and ignore the result; if runtime provides a cancel API, call it.
      abortRef.current = true;
      setIsRunning(false);
      setOutput("[Stopping execution — result may still arrive if runtime cannot be aborted]");
      // If runtime provides cancellation method, call it:
      try {
        if (php && typeof php.kill === "function") php.kill();
        if (php && typeof php.terminate === "function") php.terminate();
      } catch (e) {
        // ignore
      }
    };

    // Render the output either in an iframe (if HTML) or as preformatted text
    const renderOutput = () => {
      if (!output && !error) return null;
      if (error) {
        return <div className="text-red-600">{error}</div>;
      }
      if (looksLikeHTML(output)) {
        // Use sandboxed iframe to render HTML safely
        return (
          <div className="mt-2 border rounded">
            <iframe
              ref={iframeRef}
              title="PHP Output"
              sandbox="allow-scripts"
              srcDoc={output}
              style={{ width: "100%", minHeight: 150, border: 0 }}
            />
          </div>
        );
      }
      // plain text -> show pre with escaped HTML
      return (
        <pre className="mt-2 p-3 bg-gray-100 border rounded text-sm whitespace-pre-wrap overflow-auto">
          {escapeHtml(output)}
        </pre>
      );
    };

    return (
      <div className="mt-4 border rounded-md p-3 bg-gray-50">
        <pre className="line-numbers language-php rounded-md text-sm bg-gray-900 text-gray-100 p-3 overflow-hidden">
          <code
            className="language-php"
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => setSrc(e.currentTarget.textContent || "")}
            // keep the initially provided src inside the editable code
            dangerouslySetInnerHTML={{ __html: escapeHtml(src) }}
          />
        </pre>

        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => runCode({ timeoutMs: 8000 })}
            disabled={isLoadingRuntime || isRunning}
            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
          >
            {isLoadingRuntime ? "Loading runtime..." : isRunning ? "Running..." : "Run PHP"}
          </button>

          <button
            onClick={() => {
              setSrc(code || "");
              setOutput("");
              setError(null);
            }}
            className="px-3 py-1 border rounded-md text-sm"
          >
            Reset
          </button>

          <button
            onClick={() => {
              setOutput("");
              setError(null);
              setTimedOut(false);
            }}
            className="px-3 py-1 border rounded-md text-sm"
          >
            Clear
          </button>

          <button
            onClick={stopExecution}
            disabled={!isRunning}
            className="px-3 py-1 border rounded-md text-sm text-red-600"
          >
            Stop
          </button>

          <div className="ml-auto text-xs text-gray-500">
            {php ? "php-wasm: ready" : isLoadingRuntime ? "php-wasm: loading" : "php-wasm: not loaded"}
          </div>
        </div>

        <div className="mt-2 p-2 bg-white border rounded-md text-sm min-h-[40px]">
          <strong>Output:</strong>
          <div className="mt-1">{renderOutput()}</div>
        </div>

        {timedOut && (
          <div className="mt-2 text-sm text-orange-600">
            Execution timed out. Try increasing the timeout or simplifying the script.
          </div>
        )}
      </div>
    );
  }
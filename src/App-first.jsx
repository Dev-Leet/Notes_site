import React, { useState, useMemo } from "react";

// PHP Comprehensive Notes - Single File React Component
// Tailwind CSS assumed to be available in the project

export default function PHPNotesSite() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("Intro");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Sections data: title, brief, content (JSX)
  const sections = useMemo(() => [
    {
      id: "Intro",
      title: "Introduction to PHP",
      summary:
        "High-level overview of PHP: server-side scripting, usage, and common patterns.",
      content: (
        <>
          <p className="mb-4">PHP (<strong>Hypertext Preprocessor</strong>) is a popular open-source server-side scripting language used to build dynamic web pages and web applications. PHP runs on the server and outputs HTML (or other formats) to the client.</p>

          <h4 className="mt-6 font-semibold">Key characteristics</h4>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Server-side execution — generates responses on the server.</li>
            <li>Loose/weak typing — type inferred from values.</li>
            <li>Integrates well with HTML, databases (MySQL, PostgreSQL), and web servers (Apache, Nginx).</li>
            <li>Files typically end with <code>.php</code>.</li>
          </ul>

          <div className="mt-6">
            <h5 className="font-medium">Code example — Basic PHP file</h5>
            <pre className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-auto mt-2 text-sm"><code>{`<?php
// hello.php
$greeting = "Hello, world!";
echo "<h1>$greeting</h1>";
?>`}</code></pre>
          </div>
        </>
      ),
    },
    {
      id: "Syntax",
      title: "PHP Syntax",
      summary: "Tags, semicolons, case-sensitivity, embedding with HTML.",
      content: (
        <>
          <p className="mb-3">PHP code is written between <code>&lt;?php</code> and <code>?&gt;</code> tags. Statements end with semicolons. Variable names are case-sensitive; language keywords are not.</p>

          <table className="w-full text-sm border-collapse mb-4">
            <thead>
              <tr className="bg-gray-100 text-left"><th className="p-2 border">Element</th><th className="p-2 border">Syntax / Note</th></tr>
            </thead>
            <tbody>
              <tr><td className="p-2 border">PHP Tag</td><td className="p-2 border"><code>&lt;?php ... ?&gt;</code></td></tr>
              <tr><td className="p-2 border">End statement</td><td className="p-2 border">Semicolon <code>;</code></td></tr>
              <tr><td className="p-2 border">Variables</td><td className="p-2 border">Start with <code>$</code>, case-sensitive</td></tr>
            </tbody>
          </table>

          <div>
            <h5 className="font-medium">Code vs Output</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <h6 className="font-semibold">Code</h6>
                <pre className="bg-gray-900 text-gray-100 rounded-md p-3 text-sm"><code>{`<?php
$name = "Alice";
echo "<p>Welcome, $name</p>";
?>`}</code></pre>
              </div>
              <div>
                <h6 className="font-semibold">Output</h6>
                <div className="bg-white rounded-md border p-3 text-sm">
                  <p>&lt;p&gt;Welcome, Alice&lt;/p&gt;</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "Comments",
      title: "Comments",
      summary: "Single-line and multi-line comments",
      content: (
        <>
          <p>PHP supports the following comment styles:</p>
          <ul className="list-disc ml-6 mt-2">
            <li><code>// single-line</code></li>
            <li><code># single-line</code></li>
            <li><code>/* multi-line */</code></li>
          </ul>

          <pre className="bg-gray-900 text-gray-100 rounded-md p-4 mt-3 text-sm"><code>{`<?php
// This is a single-line comment
# This is also valid
/*
  This is a multi-line comment
*/
?>`}</code></pre>
        </>
      ),
    },
    {
      id: "Variables",
      title: "Variables & Scope",
      summary: "Declaration, assignment and scopes: global, local, static",
      content: (
        <>
          <p className="mb-2">Variables begin with <code>$</code>. PHP infers types at runtime.</p>

          <h6 className="font-semibold">Scope</h6>
          <ul className="list-disc ml-6 mt-2">
            <li><strong>Global:</strong> declared in global scope; use <code>global</code> keyword or <code>$GLOBALS</code> to access inside functions.</li>
            <li><strong>Local:</strong> inside functions; not available outside.</li>
            <li><strong>Static:</strong> inside a function, value persists between calls using <code>static</code>.</li>
          </ul>

          <div className="mt-4">
            <h6 className="font-semibold">Examples (code vs output)</h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <pre className="bg-gray-900 text-gray-100 p-3 rounded-md text-sm"><code>{`<?php
$x = 5; // global
function showX() {
  global $x; // import global
  echo $x;
}
?>`}</code></pre>
              </div>
              <div className="bg-white border rounded-md p-3 text-sm">Output: <code>5</code> (when <code>showX()</code> is invoked)</div>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "EchoPrint",
      title: "Echo & Print",
      summary: "Output functions: echo vs print vs print_r vs var_dump",
      content: (
        <>
          <p>Commonly used output methods are:</p>
          <ul className="list-disc ml-6 mt-2">
            <li><code>echo</code> — fastest, can output multiple parameters (no return value).</li>
            <li><code>print</code> — returns 1, can be used in expressions.</li>
            <li><code>print_r()</code> — human-readable array/object dump (good for debugging).</li>
            <li><code>var_dump()</code> — detailed dump with types and lengths.</li>
          </ul>

          <pre className="bg-gray-900 text-gray-100 rounded-md p-3 mt-3 text-sm"><code>{`<?php
$val = [1,2,3];
echo "Hello"; // prints Hello
print("World");
print_r($val); // prints Array ( [0] => 1 [1] => 2 [2] => 3 )
var_dump($val); // prints type and length
?>`}</code></pre>
        </>
      ),
    },
    {
      id: "DataTypes",
      title: "Data Types",
      summary: "Primitive and compound data types in PHP",
      content: (
        <>
          <p>PHP primitive types include <code>int</code>, <code>float</code>, <code>string</code>, <code>bool</code>, <code>null</code>. Compound types include <code>array</code> and <code>object</code>. Special types: <code>resource</code>, <code>callable</code>.</p>

          <table className="w-full text-sm border-collapse mt-3">
            <thead>
              <tr className="bg-gray-100 text-left"><th className="p-2 border">Type</th><th className="p-2 border">Example</th><th className="p-2 border">Notes</th></tr>
            </thead>
            <tbody>
              <tr><td className="p-2 border">Integer</td><td className="p-2 border"><code>42</code></td><td className="p-2 border">Whole numbers</td></tr>
              <tr><td className="p-2 border">Float</td><td className="p-2 border"><code>3.14</code></td><td className="p-2 border">Decimal numbers</td></tr>
              <tr><td className="p-2 border">String</td><td className="p-2 border"><code>"abc"</code></td><td className="p-2 border">Text, supports single/double quotes</td></tr>
              <tr><td className="p-2 border">Boolean</td><td className="p-2 border"><code>true</code>/<code>false</code></td><td className="p-2 border">Logical values</td></tr>
              <tr><td className="p-2 border">Array</td><td className="p-2 border"><code>array(1,2)</code></td><td className="p-2 border">Ordered map of values</td></tr>
            </tbody>
          </table>

          <div className="mt-4">
            <h6 className="font-semibold">Type inspection</h6>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded-md text-sm mt-2"><code>{`<?php
$val = "123";
echo gettype($val); // string
var_dump($val); // shows type and length
?>`}</code></pre>
          </div>
        </>
      ),
    },
    {
      id: "Strings",
      title: "Strings",
      summary: "Creation, concatenation, slicing, escape sequences and common functions",
      content: (
        <>
          <p>Strings are sequences of characters written in single or double quotes. Double-quoted strings support variable interpolation and escape sequences, while single quoted strings are more literal.</p>

          <div className="mt-3">
            <h6 className="font-semibold">Concatenation & examples</h6>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded-md text-sm mt-2"><code>{`<?php
$a = "Hello";
$b = "World";
$c = $a . " " . $b; // Hello World
$len = strlen($c); // 11
$substr = substr($c, 6, 5); // World
$replaced = str_replace("World", "PHP", $c); // Hello PHP
?>`}</code></pre>

            <p className="mt-3">Escape characters: <code>\n</code>, <code>\t</code>, <code>\\</code>, <code>\"</code>, <code>\'</code>.</p>
          </div>

          <div className="mt-4">
            <h6 className="font-semibold">Code vs Output mapping</h6>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <pre className="bg-gray-900 text-gray-100 p-3 rounded-md text-sm"><code>{`$s = "Line1\nLine2";
echo nl2br($s);`}</code></pre>
              </div>
              <div className="bg-white border rounded-md p-3 text-sm">Output: <code>Line1<br/>Line2</code></div>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "Numbers",
      title: "Numbers & Math",
      summary: "Integers, floats and math functions",
      content: (
        <>
          <p>PHP supports integer and floating-point numbers. Arithmetic uses <code>+ - * / %</code> and <code>**</code> for exponentiation.</p>

          <table className="w-full text-sm border-collapse mt-3">
            <thead>
              <tr className="bg-gray-100 text-left"><th className="p-2 border">Function</th><th className="p-2 border">What it does</th></tr>
            </thead>
            <tbody>
              <tr><td className="p-2 border">abs()</td><td className="p-2 border">Absolute value</td></tr>
              <tr><td className="p-2 border">sqrt()</td><td className="p-2 border">Square root</td></tr>
              <tr><td className="p-2 border">round()</td><td className="p-2 border">Round float</td></tr>
              <tr><td className="p-2 border">min(), max()</td><td className="p-2 border">Min and max</td></tr>
            </tbody>
          </table>

          <pre className="bg-gray-900 text-gray-100 p-3 rounded-md mt-3 text-sm"><code>{`<?php
echo round(3.14159, 2); // 3.14
echo pow(2,3); // 8
echo rand(1,10); // random between 1 and 10
?>`}</code></pre>
        </>
      ),
    },
    {
      id: "Casting",
      title: "Casting",
      summary: "Explicit conversion between types",
      content: (
        <>
          <p>Use cast operators to convert types: <code>(int)</code>, <code>(float)</code>, <code>(string)</code>, <code>(bool)</code>, <code>(array)</code>, <code>(object)</code>.</p>

          <pre className="bg-gray-900 text-gray-100 p-3 rounded-md mt-3 text-sm"><code>{`<?php
$x = (int)"123"; // 123
$y = (bool)0; // false
$z = (string)42; // "42"
?>`}</code></pre>
        </>
      ),
    },
    {
      id: "Constants",
      title: "Constants & Magic Constants",
      summary: "Immutable values and context-aware special constants",
      content: (
        <>
          <p>Define constants with <code>define('NAME', value)</code> or <code>const NAME = value</code>. Magic constants like <code>__LINE__</code>, <code>__FILE__</code>, <code>__DIR__</code> provide context information.</p>

          <pre className="bg-gray-900 text-gray-100 p-3 rounded-md mt-3 text-sm"><code>{`<?php
define('APP_VERSION', '1.0');
const PI = 3.14159;
echo __FILE__;
?>`}</code></pre>
        </>
      ),
    },
    {
      id: "Operators",
      title: "Operators",
      summary: "Arithmetic, comparison, logical, string, array, and ternary operators",
      content: (
        <>
          <p>Common operators include arithmetic (<code>+ - * / % **</code>), comparison (<code>== === != !== &lt; &gt;</code>), logical (<code>&amp;&amp; || !</code> or <code>and</code>/<code>or</code>), string concatenation (<code>.</code>), and array operators.</p>

          <div className="mt-3">
            <h6 className="font-semibold">Ternary and Null Coalescing</h6>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded-md mt-2 text-sm"><code>{`$status = ($age >= 18) ? 'adult' : 'minor';
// Null coalescing (PHP 7+)
$username = $_GET['user'] ?? 'guest';`}</code></pre>
          </div>
        </>
      ),
    },
    {
      id: "IfElse",
      title: "If / Else / Elseif",
      summary: "Conditional branching patterns and shorthand forms",
      content: (
        <>
          <p>Use <code>if</code>, <code>elseif</code>, and <code>else</code> for branching. The ternary operator and shorthand <code>?:</code> offer compact forms.</p>

          <pre className="bg-gray-900 text-gray-100 p-3 rounded-md mt-2 text-sm"><code>{`<?php
if ($a > $b) {
  echo 'a greater than b';
} elseif ($a == $b) {
  echo 'equal';
} else {
  echo 'b greater';
}
?>`}</code></pre>
        </>
      ),
    },
    {
      id: "Switch",
      title: "Switch",
      summary: "Multi-way selection using switch/case/default",
      content: (
        <>
          <p>Switch tests a single expression against multiple <code>case</code> values. Use <code>break</code> to avoid fall-through.</p>

          <pre className="bg-gray-900 text-gray-100 p-3 rounded-md mt-2 text-sm"><code>{`<?php
switch($role) {
  case 'admin':
    echo 'admin dashboard';
    break;
  case 'editor':
    echo 'editor area';
    break;
  default:
    echo 'public area';
}
?>`}</code></pre>
        </>
      ),
    },
    {
      id: "Loops",
      title: "Loops",
      summary: "while, do-while, for, foreach, and control flow (break/continue)",
      content: (
        <>
          <p>Loops let you repeat code blocks. Choose the appropriate loop depending on whether you know iteration count or just a condition.</p>

          <div className="grid md:grid-cols-2 gap-4 mt-3">
            <div>
              <h6 className="font-semibold">for</h6>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded-md text-sm"><code>{`for ($i=0; $i<5; $i++) {
  echo $i;
}`}</code></pre>
            </div>
            <div>
              <h6 className="font-semibold">while</h6>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded-md text-sm"><code>{`$i = 0;
while ($i < 5) {
  echo $i;
  $i++;
}`}</code></pre>
            </div>
          </div>

          <div className="mt-3">
            <h6 className="font-semibold">foreach</h6>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded-md text-sm mt-2"><code>{`$arr = ['a', 'b', 'c'];
foreach ($arr as $k => $v) {
  echo "$k => $v";
}`}</code></pre>

            <p className="mt-2">Use <code>break</code> to exit a loop and <code>continue</code> to skip to the next iteration.</p>
          </div>
        </>
      ),
    },
    {
      id: "Arrays",
      title: "Arrays",
      summary: "Indexed, associative, multidimensional arrays and common operations",
      content: (
        <>
          <p>Arrays are flexible containers for values. PHP arrays can be numeric (indexed) or associative (keyed). They can also be nested (multidimensional).</p>

          <h6 className="font-semibold mt-3">Create / Access / Modify</h6>
          <pre className="bg-gray-900 text-gray-100 p-3 rounded-md mt-2 text-sm"><code>{`$cars = ['Volvo', 'BMW', 'Toyota'];
echo $cars[1]; // BMW
$assoc = ['name' => 'John', 'age' => 30];
$assoc['age'] = 31; // update
$assoc[] = 'extra'; // append`}</code></pre>

          <h6 className="font-semibold mt-3">Sorting and utility</h6>
          <table className="w-full text-sm border-collapse mt-3">
            <thead>
              <tr className="bg-gray-100 text-left"><th className="p-2 border">Function</th><th className="p-2 border">Description</th></tr>
            </thead>
            <tbody>
              <tr><td className="p-2 border">sort()</td><td className="p-2 border">Sort indexed array ascending, reindexing keys</td></tr>
              <tr><td className="p-2 border">asort()</td><td className="p-2 border">Sort associative array by value, keep keys</td></tr>
              <tr><td className="p-2 border">ksort()</td><td className="p-2 border">Sort associative array by key</td></tr>
              <tr><td className="p-2 border">array_merge()</td><td className="p-2 border">Merge arrays</td></tr>
            </tbody>
          </table>
        </>
      ),
    },
    {
      id: "SuperGlobals",
      title: "SuperGlobals",
      summary: "Built-in arrays always available: $_GET, $_POST, $_SERVER, $_SESSION, etc.",
      content: (
        <>
          <p>Superglobals are pre-defined associative arrays in PHP and are accessible in any scope.</p>

          <ul className="list-disc ml-6 mt-2">
            <li><code>$_GET</code> — query parameters</li>
            <li><code>$_POST</code> — POSTed form data</li>
            <li><code>$_SERVER</code> — server and execution info</li>
            <li><code>$_FILES</code> — uploaded files</li>
            <li><code>$_SESSION</code> — session variables (requires <code>session_start()</code>)</li>
            <li><code>$_COOKIE</code> — cookies</li>
          </ul>

          <div className="mt-3">
            <h6 className="font-semibold">Example — reading query param</h6>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded-md text-sm mt-2"><code>{`<?php
// URL: page.php?user=dev
$user = $_GET['user'] ?? 'guest';
echo "Hello, $user";
?>`}</code></pre>
          </div>
        </>
      ),
    },
    {
      id: "Regex",
      title: "Regular Expressions (RegEx)",
      summary: "PCRE-based functions: preg_match, preg_replace, preg_split",
      content: (
        <>
          <p>PHP uses PCRE (Perl-compatible) for regular expressions. Use <code>preg_match()</code> for testing, <code>preg_replace()</code> to replace, and <code>preg_match_all()</code> to find all matches.</p>

          <div className="mt-3">
            <h6 className="font-semibold">Example — simple match</h6>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded-md text-sm mt-2"><code>{`<?php
if (preg_match('/^Hello/i', $str)) {
  echo 'Starts with Hello';
}
?>`}</code></pre>

            <p className="mt-2">Modifiers: <code>i</code> (case-insensitive), <code>m</code> (multiline), <code>s</code> (dot matches newline), etc.</p>
          </div>
        </>
      ),
    },
  ], []);

  const filtered = sections.filter(s => {
    const q = query.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.summary.toLowerCase().includes(q) ||
      (s.content && JSON.stringify(String(s.content)).toLowerCase().includes(q))
    );
  });

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Code copied to clipboard');
    } catch (e) {
      alert('Copy failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(s => !s)}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Toggle sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="text-xl font-semibold">PHP: Comprehensive Notes</h1>
          <span className="ml-3 text-sm text-gray-500">Academic — Interactive Guide</span>
        </div>

        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sections or text..."
            className="px-3 py-2 border rounded-md text-sm w-64 bg-gray-50"
          />
          <a href="#print" onClick={(e) => { e.preventDefault(); window.print(); }} className="text-sm px-3 py-2 border rounded-md">Print / Save PDF</a>
        </div>
      </header>

      <main className="flex">
        {sidebarOpen && (
          <aside className="w-72 bg-white border-r p-4 sticky top-16 h-[calc(100vh-64px)] overflow-auto">
            <nav>
              <h3 className="font-semibold mb-3">Contents</h3>
              <ul className="space-y-1">
                {sections.map(s => (
                  <li key={s.id}>
                    <button
                      onClick={() => { setActive(s.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className={`w-full text-left p-2 rounded-md hover:bg-gray-100 ${active === s.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                    >
                      <div className="text-sm font-medium">{s.title}</div>
                      <div className="text-xs text-gray-500">{s.summary}</div>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-2">Quick filters</h4>
              <div className="flex flex-col gap-2">
                <button onClick={() => { setQuery(''); setActive('Intro'); }} className="text-sm px-3 py-2 border rounded">Reset search</button>
                <button onClick={() => setQuery('array')} className="text-sm px-3 py-2 border rounded">Find arrays</button>
                <button onClick={() => setQuery('regex')} className="text-sm px-3 py-2 border rounded">Find regex</button>
              </div>
            </div>
          </aside>
        )}

        <section className="flex-1 p-8 max-w-[900px]">
          <article className="prose prose-slate max-w-none">
            {filtered.length === 0 ? (
              <div className="p-6 bg-white border rounded-md text-center">No results. Try a different keyword.</div>
            ) : (
              filtered.map(s => (
                <section key={s.id} id={s.id} className="mb-10">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold">{s.title}</h2>
                      <p className="text-sm text-gray-500 mt-1">{s.summary}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => handleCopy(typeof s.content === 'string' ? s.content : 'See code block')} className="text-sm px-3 py-1 border rounded">Copy</button>
                      <a href={`#${s.id}`} className="text-sm px-3 py-1 border rounded">Link</a>
                    </div>
                  </div>

                  <div className="mt-4 bg-white border rounded-md p-5 shadow-sm">
                    {s.content}
                  </div>
                </section>
              ))
            )}
          </article>

          <footer className="mt-12 text-sm text-gray-500">
            <hr className="mb-4" />
            <div className="flex items-center justify-between">
              <div>© {new Date().getFullYear()} PHP Notes — Academic Edition</div>
              <div>Built with React + Tailwind</div>
            </div>
          </footer>
        </section>

        {/* Right column: quick reference */}
        <aside className="w-96 p-4 border-l hidden lg:block h-[calc(100vh-64px)] sticky top-16 overflow-auto bg-white">
          <div>
            <h4 className="font-semibold">Quick Reference</h4>
            <div className="mt-3 text-sm space-y-3">
              <div>
                <strong>Common functions:</strong>
                <ul className="ml-4 list-disc mt-2 text-xs">
                  <li><code>strlen()</code>, <code>substr()</code>, <code>str_replace()</code></li>
                  <li><code>array_merge()</code>, <code>count()</code>, <code>array_slice()</code></li>
                  <li><code>preg_match()</code>, <code>preg_replace()</code>, <code>var_dump()</code></li>
                </ul>
              </div>

              <div>
                <strong>Operators summary:</strong>
                <table className="w-full text-xs mt-2">
                  <tbody>
                    <tr><td className="py-1">Arithmetic</td><td className="text-right">+ - * / % **</td></tr>
                    <tr><td className="py-1">Comparison</td><td className="text-right">== === != !== &lt; &gt;</td></tr>
                    <tr><td className="py-1">String</td><td className="text-right">. (concatenate)</td></tr>
                    <tr><td className="py-1">Logical</td><td className="text-right">&& || ! (and / or)</td></tr>
                  </tbody>
                </table>
              </div>

              <div>
                <strong>Magic constants:</strong>
                <p className="text-xs mt-1">__FILE__, __DIR__, __LINE__, __FUNCTION__, __CLASS__, __METHOD__</p>
              </div>

              <div>
                <strong>Superglobals:</strong>
                <p className="text-xs mt-1">$_GET, $_POST, $_SERVER, $_FILES, $_SESSION, $_COOKIE, $GLOBALS</p>
              </div>

              <div className="mt-4">
                <h5 className="font-semibold">Study tips</h5>
                <ol className="list-decimal ml-4 text-xs mt-2">
                  <li>Practice small snippets: variables, loops, arrays.</li>
                  <li>Use <code>var_dump()</code> and <code>print_r()</code> while debugging.</li>
                  <li>Study array functions — they appear often in exercises.</li>
                </ol>
              </div>
            </div>
          </div>
        </aside>

      </main>
    </div>
  );
}

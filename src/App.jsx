import React, { useState, useMemo, useEffect } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";
import "prismjs/plugins/line-numbers/prism-line-numbers";

export default function PHPNotesSite() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("Intro");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  function LiveCodeRunner({ code }) {
    const [src, setSrc] = useState(code);
    const [output, setOutput] = useState("");

    const runCode = () => {
      if (src.includes("echo")) {
        let simulated = src
          .replace(/<\?php/g, "")
          .replace(/\?>/g, "")
          .replace(/echo/g, "")
          .replace(/;/g, "")
          .trim();
        setOutput(simulated);
      } else {
        setOutput("[Simulation only: PHP execution not available here]");
      }
    };

    useEffect(() => {
      Prism.highlightAll();
    }, [src]);

    return (
      <div className="mt-4 border rounded-md p-3 bg-gray-50">
        <pre className="line-numbers language-php rounded-md text-sm bg-gray-900 text-gray-100 p-3 overflow-hidden">
          <code
            className="language-php"
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => setSrc(e.currentTarget.textContent || "")}
          >
            {src}
          </code>
        </pre>
        <div className="flex gap-2 mt-2">
          <button onClick={runCode} className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">
            Run PHP
          </button>
          <button onClick={() => setOutput("")} className="px-3 py-1 border rounded-md text-sm">
            Clear
          </button>
        </div>
        <div className="mt-2 p-2 bg-white border rounded-md text-sm min-h-[40px]">
          <strong>Output:</strong>
          <div className="mt-1 whitespace-pre-wrap">{output}</div>
        </div>
      </div>
    );
  }

  const sections = useMemo(
    () => [
      {
        id: "Intro",
        title: "Introduction to PHP",
        summary: "High-level overview of PHP: server-side scripting, usage, and common patterns.",
        content: (
          <>
            <p className="mb-4">
              PHP (<strong>Hypertext Preprocessor</strong>) is a popular open-source server-side scripting language used to build dynamic web pages and applications. It integrates with HTML and databases.
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Server-side execution — generates responses on the server.</li>
              <li>Loose/weak typing — types inferred automatically.</li>
              <li>Integrates with HTML, MySQL, PostgreSQL, Apache, Nginx.</li>
              <li>Files end with <code>.php</code>.</li>
            </ul>
            <LiveCodeRunner code={`<?php\n$greeting = "Hello, world!";\necho "<h1>$greeting</h1>";\n?>`} />
          </>
        ),
      },
      {
        id: "Syntax",
        title: "PHP Syntax",
        summary: "Tags, semicolons, case-sensitivity, embedding with HTML.",
        content: (
          <>
            <h4 className="font-semibold">PHP Tags</h4>
            <p>PHP scripts start with <code>&lt;?php</code> and end with <code>?&gt;</code>. Within these tags, you write PHP code.</p>

            <h4 className="mt-3 font-semibold">File Extension</h4>
            <p>By convention, files containing PHP code use the <code>.php</code> extension.</p>

            <h4 className="mt-3 font-semibold">Semicolon</h4>
            <p>Each PHP statement must end with a semicolon (<code>;</code>).</p>

            <h4 className="mt-3 font-semibold">Case Sensitivity</h4>
            <p>PHP keywords and function names are not case-sensitive (e.g., <code>echo</code> or <code>ECHO</code> both work), but variable names are case-sensitive.</p>

            <LiveCodeRunner code={`<?php\necho "Hello PHP!";\nECHO " Works too!";\n?>`} />
          </>
        ),
      },
      {
        id: "Comments",
        title: "Comments",
        summary: "Single-line and multi-line comments.",
        content: (
          <>
            <h4 className="font-semibold">Purpose</h4>
            <p>Comments are annotations in the code that are ignored during execution; they help explain and document code.</p>

            <h4 className="mt-3 font-semibold">Syntax</h4>
            <p>PHP supports three comment styles:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Single-line comments: start with <code>{'//'}</code> or <code>#</code>.</li>
              <li>Multi-line comments: enclosed between <code>{'/*'}</code> and <code>*/</code>.</li>
            </ul>

            <LiveCodeRunner code={`<?php\n// Single-line comment\n# Another single-line comment\n/*\n Multi-line comment\n*/\n?>`} />
          </>
        ),
      },
      {
        id: "Variables",
        title: "Variables & Scope",
        summary: "Declaration, assignment and scopes: global, local, static.",
        content: (
          <>
            <h4 className="font-semibold">Declaration</h4>
            <p>Variables start with a dollar sign (<code>$</code>) followed by a name. Variable names are case-sensitive.</p>

            <h4 className="mt-3 font-semibold">Assignment</h4>
            <p>Use the <code>=</code> operator: e.g. <code>$x = 5;</code> or <code>$name = "Alice";</code>. PHP is loosely typed, so types are inferred.</p>

            <h4 className="mt-3 font-semibold">Output</h4>
            <p>Use <code>echo</code> or <code>print</code> to send variables/strings to output.</p>

            <h4 className="mt-3 font-semibold">Variable Scope</h4>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Global:</strong> Defined outside functions; accessible outside unless declared global inside.</li>
              <li><strong>Local:</strong> Defined inside functions; accessible only inside.</li>
              <li><strong>Global keyword:</strong> Use <code>global</code> inside a function to access global variables.</li>
              <li><strong>$GLOBALS:</strong> Superglobal array to access globals.</li>
              <li><strong>Static:</strong> Retain value between function calls.</li>
            </ul>

            <LiveCodeRunner code={`<?php\n$x = 5; // global\nfunction test(){\n  static $count = 0;\n  $count++;\n  echo $count;\n}\ntest();\ntest();\n?>`} />
          </>
        ),
      },
      {
        id: "EchoPrint",
        title: "Echo & Print",
        summary: "Output functions: echo vs print vs print_r vs var_dump.",
        content: (
          <>
            <h4 className="font-semibold">echo</h4>
            <p>Fastest, can output multiple parameters. No return value.</p>

            <h4 className="mt-3 font-semibold">print</h4>
            <p>Returns 1, can be used in expressions.</p>

            <h4 className="mt-3 font-semibold">print_r()</h4>
            <p>Human-readable dump of arrays/objects; useful for debugging.</p>

            <h4 className="mt-3 font-semibold">var_dump()</h4>
            <p>Detailed dump with types and lengths.</p>

            <LiveCodeRunner code={`<?php\necho "Hello";\nprint " World";\n$arr=[1,2,3];\nprint_r($arr);\nvar_dump($arr);\n?>`} />
          </>
        ),
      },
      {
        id: "DataTypes",
        title: "Data Types",
        summary: "Primitive and compound data types in PHP",
        content: (
          <>
            <p>PHP supports several data types:</p>
            <table className="table-auto border-collapse border border-gray-400 mt-3">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-400 px-2 py-1">Data Type</th>
                  <th className="border border-gray-400 px-2 py-1">Example</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border px-2 py-1">int</td><td className="border px-2 py-1">42</td></tr>
                <tr><td className="border px-2 py-1">float</td><td className="border px-2 py-1">3.14</td></tr>
                <tr><td className="border px-2 py-1">string</td><td className="border px-2 py-1">"Hello"</td></tr>
                <tr><td className="border px-2 py-1">bool</td><td className="border px-2 py-1">true or false</td></tr>
                <tr><td className="border px-2 py-1">array</td><td className="border px-2 py-1">array(1, 2, 3)</td></tr>
                <tr><td className="border px-2 py-1">object</td><td className="border px-2 py-1">new MyClass()</td></tr>
                <tr><td className="border px-2 py-1">null</td><td className="border px-2 py-1">null</td></tr>
              </tbody>
            </table>
            <LiveCodeRunner code={`<?php\n$x = 42;\n$y = 3.14;\n$z = "Hello";\n$b = true;\n$arr = array(1, 2, 3);\necho $x;\n?>`} />
          </>
        ),
      },
      {
        id: "Strings",
        title: "Strings",
        summary: "Creation, concatenation, slicing, escape sequences and common functions",
        content: (
          <>
            <p>A string is a sequence of characters in single (<code>'...'</code>) or double quotes (<code>"..."</code>).</p>
            <p>Double-quoted strings parse escape sequences and variables; single-quoted do not.</p>
            <p>Concatenate with the dot (<code>.</code>) operator.</p>

            <h4 className="mt-3 font-semibold">Escape Characters</h4>
            <p>Use backslash (<code>\\</code>) to escape special characters like <code>\"</code>, <code>\n</code>, <code>\t</code>, etc.</p>

            <h4 className="mt-3 font-semibold">Common Functions</h4>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><code>strlen()</code> — string length</li>
              <li><code>str_replace()</code> — replace substrings</li>
              <li><code>strrev()</code> — reverse string</li>
              <li><code>trim()</code> — remove whitespace</li>
              <li><code>explode()</code> — split string</li>
            </ul>

            <LiveCodeRunner code={`<?php\n$s1 = "Hello";\n$s2 = "World";\necho $s1 . " " . $s2; // concatenation\necho strlen($s1);\n?>`} />
          </>
        ),
      },
      {
        id: "NumbersMath",
        title: "Numbers & Math",
        summary: "Integers, floats and math functions",
        content: (
          <>
            <h4 className="font-semibold">Numeric Types</h4>
            <p>PHP has integers and floats. Numeric strings (e.g. "123") are treated as numbers in numeric contexts.</p>

            <h4 className="mt-3 font-semibold">Special Values</h4>
            <p>INF (infinity), NAN (not-a-number) may result from invalid operations.</p>

            <h4 className="mt-3 font-semibold">Math Functions</h4>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><code>pi()</code>, <code>min()</code>, <code>max()</code></li>
              <li><code>abs()</code>, <code>sqrt()</code>, <code>round()</code></li>
              <li><code>rand()</code>, <code>mt_rand()</code></li>
            </ul>

            <h4 className="mt-3 font-semibold">Operators</h4>
            <table className="table-auto border-collapse border border-gray-400 mt-3">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-2 py-1">Operator</th>
                  <th className="border px-2 py-1">Description</th>
                  <th className="border px-2 py-1">Example</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border px-2 py-1">+</td><td className="border px-2 py-1">Addition</td><td className="border px-2 py-1">2+3=5</td></tr>
                <tr><td className="border px-2 py-1">-</td><td className="border px-2 py-1">Subtraction</td><td className="border px-2 py-1">5-2=3</td></tr>
                <tr><td className="border px-2 py-1">*</td><td className="border px-2 py-1">Multiplication</td><td className="border px-2 py-1">4*3=12</td></tr>
                <tr><td className="border px-2 py-1">/</td><td className="border px-2 py-1">Division</td><td className="border px-2 py-1">10/2=5</td></tr>
                <tr><td className="border px-2 py-1">%</td><td className="border px-2 py-1">Modulus</td><td className="border px-2 py-1">7%4=3</td></tr>
                <tr><td className="border px-2 py-1">**</td><td className="border px-2 py-1">Exponentiation</td><td className="border px-2 py-1">2**3=8</td></tr>
                <tr><td className="border px-2 py-1">.</td><td className="border px-2 py-1">Concatenation</td><td className="border px-2 py-1">"Hello"."World"</td></tr>
              </tbody>
            </table>

            <LiveCodeRunner code={`<?php\necho 2+3;\necho sqrt(16);\necho round(3.7);\necho rand(1,10);\n?>`} />
          </>
        ),
      },
      {
        id: "Casting",
        title: "Casting",
        summary: "Explicit conversion between types",
        content: (
          <>
            <p>Convert between types using cast operators: <code>(int)</code>, <code>(float)</code>, <code>(string)</code>, <code>(bool)</code>, <code>(array)</code>, <code>(object)</code>, <code>(unset)</code>.</p>
            <p>Examples: <code>(int)"123" → 123</code>, <code>(bool)0 → false</code>.</p>

            <LiveCodeRunner code={`<?php\n$val = "123";\nvar_dump((int)$val);\nvar_dump((float)$val);\nvar_dump((bool)0);\n?>`} />
          </>
        ),
      },
      {
        id: "Constants",
        title: "Constants & Magic Constants",
        summary: "Immutable values and context-aware special constants.",
        content: (
          <>
            <p className="mb-4">
              Constants are like variables except their value cannot change after defined. Define them using <code>define("NAME", value)</code> or <code>const NAME = value;</code>. Constant names do not have a leading $ and by convention are uppercase. Constants are global and accessible everywhere.
            </p>

            <p className="mb-4">
              PHP has special predefined constants (magic constants) that change based on context. Common examples include: <code>__LINE__</code>, <code>__FILE__</code>, <code>__DIR__</code>, <code>__FUNCTION__</code>, <code>__CLASS__</code>, <code>__METHOD__</code>, <code>__NAMESPACE__</code>, and <code>ClassName::class</code>.
            </p>

            <div className="mt-6">
              <h5 className="font-medium">Code example — Constants</h5>
              <LiveCodeRunner code={`<?php\ndefine("SITE_NAME", "MyWebsite");\nconst PI = 3.14;\necho SITE_NAME;\necho PI;\n?>`} />
            </div>
          </>
        ),
      },
      {
        id: "Operators",
        title: "Operators",
        summary: "Arithmetic, comparison, logical, string, array, and ternary operators.",
        content: (
          <>
            <p className="mb-4">
              PHP supports arithmetic (<code>+ - * / % **</code>), assignment (<code>=, +=, -=, *=, /=, .=</code>), comparison (<code>==, !=, ===, !==, {'<'} , {'>'} , {'<='}, {'>='}, {'<=>'} </code>), logical (<code>and, or, xor, &&, ||, !</code>), string concatenation (<code>.</code>, <code>.=</code>), array operators (<code>+</code>, <code>==</code>, <code>===</code>), ternary (<code>?:</code>), and null coalescing (<code>??</code>).
            </p>

            <div className="mt-6">
              <h5 className="font-medium">Code example — Operators</h5>
              <LiveCodeRunner code={`<?php\n$x = 10; $y = 20;\necho $x + $y; // Addition\necho $x > $y ? 'x is greater' : 'y is greater';\n?>`} />
            </div>
          </>
        ),
      },
      {
        id: "IfElse",
        title: "If / Else / Elseif",
        summary: "Conditional branching patterns and shorthand forms.",
        content: (
          <>
            <p className="mb-4">
              The <code>if</code> statement executes its block if the condition is true. <code>elseif</code> and <code>else</code> provide additional branches. You can also nest <code>if</code> statements or use the ternary shorthand.
            </p>

            <div className="mt-6">
              <h5 className="font-medium">Code example — If / Else / Elseif</h5>
              <LiveCodeRunner code={`<?php\n$a = 5; $b = 10;\nif ($a > $b) {\n  echo "$a is greater";\n} elseif ($a == $b) {\n  echo "Equal";\n} else {\n  echo "$b is greater";\n}\n?>`} />
            </div>
          </>
        ),
      },
      {
        id: "Switch",
        title: "Switch",
        summary: "Multi-way selection using switch/case/default.",
        content: (
          <>
            <p className="mb-4">
              The <code>switch</code> statement selects one of many code blocks to execute based on a value. Use <code>break</code> to exit the switch after a case. The <code>default</code> block runs if no case matches.
            </p>

            <div className="mt-6">
              <h5 className="font-medium">Code example — Switch</h5>
              <LiveCodeRunner code={`<?php\n$day = 2;\nswitch ($day) {\n  case 1:\n    echo "Monday";\n    break;\n  case 2:\n    echo "Tuesday";\n    break;\n  default:\n    echo "Other day";\n}\n?>`} />
            </div>
          </>
        ),
      },
      {
        id: "Loops",
        title: "Loops",
        summary: "while, do-while, for, foreach, and control flow (break/continue).",
        content: (
          <>
            <p className="mb-4">
              PHP provides <code>while</code>, <code>do...while</code>, <code>for</code>, and <code>foreach</code> loops. Use <code>break</code> to exit and <code>continue</code> to skip to the next iteration.
            </p>

            <div className="mt-6">
              <h5 className="font-medium">Code example — While Loop</h5>
              <LiveCodeRunner code={`<?php\n$i = 1;\nwhile ($i <= 5) {\n  echo $i;\n  $i++;\n}\n?>`} />
            </div>

            <div className="mt-6">
              <h5 className="font-medium">Code example — For Loop</h5>
              <LiveCodeRunner code={`<?php\nfor ($x = 0; $x < 5; $x++) {\n  echo "Number: $x";\n}\n?>`} />
            </div>

            <div className="mt-6">
              <h5 className="font-medium">Code example — Foreach Loop</h5>
              <LiveCodeRunner code={`<?php\n$colors = array("red", "green", "blue");\nforeach ($colors as $color) {\n  echo $color;\n}\n?>`} />
            </div>
          </>
        ),
      },
      {
      id: "Arrays",
      title: "Arrays",
      summary:
        "Indexed, associative, multidimensional arrays and common operations.",
      content: (
        <>
          <p>
            An array is a special variable that can hold multiple values under a
            single name, accessible by index or key. PHP has three main types of
            arrays:
          </p>
          <ul className="list-disc ml-6">
            <li>
              <strong>Indexed arrays:</strong> Arrays with numeric indices
              (0,1,2,...).
            </li>
            <li>
              <strong>Associative arrays:</strong> Arrays with named keys.
            </li>
            <li>
              <strong>Multidimensional arrays:</strong> Arrays containing one or
              more arrays.
            </li>
          </ul>

          <h5 className="font-medium mt-4">Creating and Modifying Arrays</h5>
          <ul className="list-disc ml-6">
            <li>
              Create: <code>$arr = array(1,2,3); $arr = [1,2,3];</code>
            </li>
            <li>
              Access: <code>$arr[index]</code> or <code>$arr[key]</code>
            </li>
            <li>
              Update: <code>$arr[1] = 20;</code>
            </li>
            <li>
              Add: <code>$arr[] = $value;</code> or{" "}
              <code>array_push($arr, $value);</code>
            </li>
            <li>
              Remove: <code>unset($arr[index]);</code>
            </li>
            <li>
              Sort: <code>sort(), rsort(), asort(), arsort(), ksort(), krsort()</code>
            </li>
            <li>
              Count: <code>count($arr)</code>
            </li>
          </ul>

          <LiveCodeRunner
            code={`<?php
$cars = array("Volvo", "BMW", "Toyota");
echo $cars[0]; // Volvo
?>`}
          />
        </>
      ),
    },
    {
      id: "Superglobals",
      title: "Superglobals",
      summary: "Built-in arrays always available: $_GET, $_POST, $_SERVER, etc.",
      content: (
        <>
          <p>
            PHP defines several built-in superglobal arrays that are always
            accessible, regardless of scope. Key superglobals include:
          </p>
          <ul className="list-disc ml-6">
            <li>
              <code>$GLOBALS</code> – References all global variables.
            </li>
            <li>
              <code>$_SERVER</code> – Server and execution environment info.
            </li>
            <li>
              <code>$_REQUEST</code> – Data from GET, POST, COOKIE (not
              recommended for new code).
            </li>
            <li>
              <code>$_POST</code>, <code>$_GET</code>, <code>$_FILES</code>,{" "}
              <code>$_COOKIE</code>, <code>$_SESSION</code>, <code>$_ENV</code>.
            </li>
          </ul>

          <LiveCodeRunner
            code={`<?php
echo $_SERVER['HTTP_USER_AGENT'];
?>`}
          />
        </>
      ),
    },
    {
      id: "Regex",
      title: "Regular Expressions (RegEx)",
      summary: "PCRE-based functions: preg_match, preg_replace, preg_split",
      content: (
        <>
          <p>
            Regular expressions are patterns used to match character
            combinations in strings. PHP uses PCRE (Perl-Compatible Regular
            Expressions).
          </p>
          <p>
            <code>preg_match($pattern, $string)</code> checks if the regex
            matches the string, returning 1 if found, 0 if not.
          </p>

          <LiveCodeRunner
            code={`<?php
$str = "Hello World";
if (preg_match("/^Hello/", $str)) {
  echo "String starts with Hello";
}
?>`}
          />

          <p className="mt-4">
            Other functions include <code>preg_replace()</code>,{" "}
            <code>preg_split()</code>, <code>preg_match_all()</code>.
          </p>
        </>
      ),
    },
      // Other sections remain unchanged from the previous file...
    ],
    []
  );


  const filtered = sections.filter((s) => s.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen((s) => !s)} className="p-2 rounded-md hover:bg-gray-100">☰</button>
          <h1 className="text-xl font-semibold">PHP: Comprehensive Notes</h1>
        </div>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="px-3 py-2 border rounded-md text-sm w-64 bg-gray-50" />
      </header>

      <main className="flex">
        {sidebarOpen && (
          <aside className="w-72 bg-white border-r p-4 sticky top-16 h-[calc(100vh-64px)] overflow-auto">
            <h3 className="font-semibold mb-3">Contents</h3>
            <ul className="space-y-1">
              {sections.map((s) => (
                <li key={s.id}>
                  <button onClick={() => setActive(s.id)} className={`w-full text-left p-2 rounded-md hover:bg-gray-100 ${active === s.id ? "bg-blue-50 border-l-4 border-blue-500" : ""}`}>
                    <div className="text-sm font-medium">{s.title}</div>
                    <div className="text-xs text-gray-500">{s.summary}</div>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <section className="flex-1 p-8 max-w-[900px]">
          {filtered.filter((s) => s.id === active).map((s) => (
            <section key={s.id} id={s.id} className="mb-10">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">{s.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">{s.summary}</p>
                </div>
              </div>
              <div className="mt-4 bg-white border rounded-md p-5 shadow-sm">{s.content}</div>
            </section>
          ))}
        </section>
      </main>
    </div>
  );
}

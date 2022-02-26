# Opcoder

Opcoder is a utility for converting LEGv8 mnemonics into instructions in hexadecimal format which supports basic syntax error detection. It is modified from Dr K. G. Smitha's [OPCoder](https://personal.ntu.edu.sg/smitha/OPCoder/OPCoder/converter.html).

## Usage

To use it in your JavaScript scripts, see the example below:

```javascript
import { convertLines } from "./opcoder.js";

const input = `ADD X5, X5, X6 // ADD
LDUR X5, [X2, #0] // LDUR
CBZ X7, #3 // CBZ
B #4 // B
STUR X5, [X2, #2] // STUR`;

console.log(convertLines(input));
```

To embed this in an HTML page, do this:

```html
<script type="module">
    import { convert } from "./opcoder.js";

    function convertLines(lines) {
        return lines
            .split("\n")
            .map(line => `${convert(line).toUpperCase()} // ${line}`);
    }

    document.getElementById("input").addEventListener("input", e => {
        const lines = document.getElementById("input").value;
        document.getElementById("result").value = convertLines(lines).join("\n");
    });
</script>
```

A working example is available [here](https://zhongruoyu.github.io/Opcoder/).

## License

Copyright (c) 2022 Zhong Ruoyu. Licensed under the MIT License.

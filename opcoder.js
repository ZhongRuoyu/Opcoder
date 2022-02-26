/**
 * Modified from Dr K. G. Smitha's OPCoder:
 * https://personal.ntu.edu.sg/smitha/OPCoder/OPCoder/converter.html
 */
"use strict";

const REGISTERS = {
    "X0": 0, "X1": 1, "X2": 2, "X3": 3, "X4": 4, "X5": 5, "X6": 6, "X7": 7,
    "X8": 8, "X9": 9, "X10": 10, "X11": 11, "X12": 12, "X13": 13, "X14": 14, "X15": 15,
    "X16": 16, "X17": 17, "X18": 18, "X19": 19, "X20": 20, "X21": 21, "X22": 22, "X23": 23,
    "X24": 24, "X25": 25, "X26": 26, "X27": 27, "X28": 28, "X29": 29, "X30": 30, "X31": 31,
    "IP0": 16, "IP1": 17, "SP": 28, "FP": 29, "LR": 30, "XZR": 31,
};

const INSTRUCTIONS = {
    "ADD": { inst: "ADD", type: "R", opcode: 0b00000000000 },
    "SUB": { inst: "SUB", type: "R", opcode: 0b00000000001 },
    "AND": { inst: "AND", type: "R", opcode: 0b00000000010 },
    "XOR": { inst: "XOR", type: "R", opcode: 0b00000000011 },
    "ORR": { inst: "ORR", type: "R", opcode: 0b00000000100 },
    "LDUR": { inst: "LDUR", type: "D", opcode: 0b00000000101 },
    "STUR": { inst: "STUR", type: "D", opcode: 0b00000000110 },
    "CBZ": { inst: "CBZ", type: "CB", opcode: 0b00000111 },
    "B": { inst: "B", type: "B", opcode: 0b001000 },
};

const OPCODE_WIDTH = {
    "R": 11,
    "D": 11,
    "CB": 8,
    "B": 6,
};

/**
 * Gets a register's number from its name.
 * @param {string} name the register's name
 * @returns {number} the register number, or `undefined` if not found
 */
function getRegister(name) {
    let register = REGISTERS[name.toUpperCase()];
    if (register === undefined) {
        if (name.startsWith("X") && name.slice(1).length > 0 && !isNaN(name.slice(1))) {
            name = `X${+name.slice(1)}`;
            register = REGISTERS[name];
        }
    }
    return register;
}
/**
 * Gets the opcode of the instruction type as a binary string.
 * @param {string} inst the instruction type
 * @return {string} the opcode of the instruction type as a binary string
 */
function getOpcode(inst) {
    const instObj = INSTRUCTIONS[inst];
    return instObj.opcode.toString(2).padStart(OPCODE_WIDTH[instObj.type]);
}

/**
 * Converts a number to a binary string. Pads the string when necessary so that
 * the resulting string reaches the given length.
 * @param {number} num the number to be converted
 * @param {number} length the minimum length of the resulting string
 * @returns {string} the resulting binary string
 */
function toBinaryString(num, length = 0) {
    num = +num;
    if (num >= 0) {
        return num.toString(2).padStart(length, "0");
    } else {
        num = ~num;
        return Array.prototype.map.call(
            num.toString(2).padStart(length, "0"),
            c => c === "0" ? "1" : "0"
        ).join("");
    }
}

/**
 * Converts a number to an unsigned hexadecimal string. Pads the string when
 * necessary so that the resulting string reaches the given length.
 * @param {number} num the number to be converted
 * @param {number} length the minimum length of the resulting string
 * @returns {string} the resulting unsigned hexadecimal string
 */
function toUnsignedHexString(num, length = 0) {
    return num.toString(16).padStart(length, "0");
}

/**
 * Converts an instruction to its hexadecimal representation.
 * @param {string} input the instruction to be converted
 * @returns {string} the hexadecimal representation of the string
 */
export function convert(input) {
    const parsedInput = input
        .toUpperCase()
        .replace(/\s*\/\/.*/, "")
        .split(/[\s,]+/)
        .filter(s => s !== "");
    if (parsedInput.length === 0) {
        // empty instruction
        return "";
    }

    const inst = INSTRUCTIONS[parsedInput[0]];
    if (inst === undefined) {
        // unrecognized instruction
        return "";
    }
    const tokens = parsedInput.slice(1)
        .flatMap(token => {
            let startingTokens = [];
            while (token.startsWith("[") || token.startsWith("]")) {
                startingTokens.push(token.slice(0, 1));
                token = token.slice(1);
            }
            let endingTokens = [];
            while (token.endsWith("[") || token.endsWith("]")) {
                endingTokens.unshift(token.slice(-1));
                token = token.slice(0, -1);
            }
            token = (token !== "") ? [token] : [];
            return [...startingTokens, ...token, ...endingTokens];
        });

    let result;
    switch (inst.type) {
        case "R": {
            if (tokens.length !== 3) {
                // syntax error
                result = "";
                break;
            }

            const rdVal = getRegister(tokens[0]);
            const rnVal = getRegister(tokens[1]);
            const rmVal = getRegister(tokens[2]);
            if (rdVal === undefined || rnVal === undefined || rmVal === undefined) {
                // syntax error
                result = "";
                break;
            }

            const opcode = getOpcode(inst.inst);
            const rm = toBinaryString(rmVal, 5);
            const shamt = "000000";
            const rn = toBinaryString(rnVal, 5);
            const rd = toBinaryString(rdVal, 5);

            const binInst = parseInt(`${opcode}${rm}${shamt}${rn}${rd}`, 2);
            result = toUnsignedHexString(binInst, 8);
            break;
        }
        case "D": {
            if (tokens.length !== 5) {
                // syntax error
                result = "";
                break;
            }

            if (tokens[1] !== "[" || tokens[4] !== "]") {
                // syntax error
                result = "";
                break;
            }
            if (!tokens[3].startsWith("#") || tokens[3] === "#" ||
                isNaN(tokens[3].slice(1))) {
                // invalid immediate value
                result = "";
                break;
            }
            const rtVal = getRegister(tokens[0]);
            const rnVal = getRegister(tokens[2]);
            const addressVal = +tokens[3].slice(1);
            if (rtVal === undefined || rnVal === undefined || addressVal === undefined) {
                // syntax error
                result = "";
                break;
            }

            const opcode = getOpcode(inst.inst);
            const address = toBinaryString(addressVal, 9);
            const op2 = "00";
            const rn = toBinaryString(rnVal, 5);
            const rt = toBinaryString(rtVal, 5);

            const binInst = parseInt(`${opcode}${address}${op2}${rn}${rt}`, 2);
            result = toUnsignedHexString(binInst, 8);
            break;
        }
        case "CB": {
            if (tokens.length !== 2) {
                // syntax error
                result = "";
                break;
            }

            if (!tokens[1].startsWith("#") || tokens[1] === "#" ||
                isNaN(tokens[1].slice(1))) {
                // invalid immediate value
                result = "";
                break;
            }
            const rtVal = getRegister(tokens[0]);
            const addressVal = +tokens[1].slice(1);
            if (rtVal === undefined || addressVal === undefined) {
                // syntax error
                result = "";
                break;
            }

            const opcode = getOpcode(inst.inst);
            const address = toBinaryString(addressVal, 19);
            const rt = toBinaryString(rtVal, 5);

            const binInst = parseInt(`${opcode}${address}${rt}`, 2);
            result = toUnsignedHexString(binInst, 8);
            break;
        }
        case "B": {
            if (tokens.length !== 1) {
                // syntax error
                result = "";
                break;
            }

            if (!tokens[0].startsWith("#") || tokens[0] === "#" ||
                isNaN(tokens[0].slice(1))) {
                // invalid immediate value
                result = "";
                break;
            }
            const addressVal = +tokens[0].slice(1);
            if (addressVal === undefined) {
                // syntax error
                result = "";
                break;
            }

            const opcode = getOpcode(inst.inst);
            const address = toBinaryString(addressVal, 26);

            const binInst = parseInt(`${opcode}${address}`, 2);
            result = toUnsignedHexString(binInst, 8);
            break;
        }
        default: {
            // unrecognized instruction
            result = "";
            break;
        }
    }

    return result;
}

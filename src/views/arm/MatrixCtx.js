import { mat4 } from 'gl-matrix'

export  default class MatrixCtx {
    constructor() {
        this.stack = [];
    }
    save(matrix) {
        this.stack.push(mat4.clone(matrix));
    }
    restore() {
        return this.stack.pop();
    }
}
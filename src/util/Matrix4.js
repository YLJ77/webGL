/**
 * This is a class treating 4x4 matrix.
 * This class contains the function that is equivalent to OpenGL matrix stack.
 * The matrix after conversion is calculated by multiplying a conversion matrix from the right.
 * The matrix is replaced by the calculated result.
 */

/**
 * Constructor of Matrix4
 * If sourceMatrix is specified, new matrix is initialized by sourceMatrix.
 * Otherwise, new matrix is initialized by identity matrix.
 * @param sourceMatrix source matrix(option)
 */
export class Matrix4 {
    constructor({ sourceMatrix } = {}) {
        if (sourceMatrix) {
            let { elements: sourceEle } = sourceMatrix;
            let elements = new Float32Array(16);
            elements.forEach((ele, index) => elements[index] = sourceEle[index]);
            this.elements = elements;
        } else {
            this.elements = new Float32Array([
                1,0,0,0,
                0,1,0,0,
                0,0,1,0,
                0,0,0,1
            ]);
        }
    }
    /**
     * Set the matrix for rotation.
     * The vector of rotation axis may not be normalized.
     * @param angle The angle of rotation (degrees)
     * @param x The X coordinate of vector of rotation axis.
     * @param y The Y coordinate of vector of rotation axis.
     * @param z The Z coordinate of vector of rotation axis.
     * @return this
     */
    setRotate ({ angle, x, y, z }) {
        let s, c, len, rlen, nc, xy, yz, zx, xs, ys, zs;

        let radian = angle * Math.PI / 180;
        let elements;

        s = Math.sin(radian);
        c = Math.cos(radian);

        if (0 !== x && 0 === y && 0 === z) {  // Rotation around X axis
            if (x < 0) {
                s = -s;
            }
            elements = [
                1, 0, 0, 0,
                0, c, s, 0,
                0, -s, c, 0,
                0, 0, 0, 1
            ];
        } else if (0 === x && 0 !== y && 0 === z) { // Rotation around Y axis
            if (y < 0) {
                s = -s;
            }
            elements = [
                c, 0, -s, 0,
                0, 1, 0, 0,
                s, 0, c, 0,
                0, 0, 0, 1
            ];
        } else if (0 === x && 0 === y && 0 !== z) { // Rotation around Z axis
            if (z < 0) {
                s = -s;
            }
            elements = [
                c, s, 0, 0,
                -s, c, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ];
        } else { // Rotation around another axis
            len = Math.sqrt(x*x + y*y + z*z);
            if (len !== 1) {
                rlen = 1 / len;
                x *= rlen;
                y *= rlen;
                z *= rlen;
            }
            nc = 1 - c;
            xy = x * y;
            yz = y * z;
            zx = z * x;
            xs = x * s;
            ys = y * s;
            zs = z * s;
            elements = [
                x*x*nc +  c, xy *nc + zs, zx *nc - ys, 0,
                xy *nc - zs, y*y*nc +  c, yz *nc + xs, 0,
                zx *nc + ys, yz *nc - xs, z*z*nc +  c, 0,
                0, 0, 0, 1
            ];
        }
        this.elements = new Float32Array(elements);
        return this;
    }
    rotate ({ angle, x, y, z }) {
        return this.concat(new Matrix4().setRotate({ angle, x, y, z }));
    }
    /**
     * Multiply the matrix from the right.
     * @param other The multiply matrix
     * @return this
     */
    concat (other) {
        var i, e, a, b, ai0, ai1, ai2, ai3;

        // Calculate e = a * b
        e = this.elements;
        a = this.elements;
        b = other.elements;

        // If e equals b, copy b to temporary matrix.
        if (e === b) {
            b = new Float32Array(16);
            for (i = 0; i < 16; ++i) {
                b[i] = e[i];
            }
        }

        for (i = 0; i < 4; i++) {
            ai0=a[i];  ai1=a[i+4];  ai2=a[i+8];  ai3=a[i+12];
            e[i]    = ai0 * b[0]  + ai1 * b[1]  + ai2 * b[2]  + ai3 * b[3];
            e[i+4]  = ai0 * b[4]  + ai1 * b[5]  + ai2 * b[6]  + ai3 * b[7];
            e[i+8]  = ai0 * b[8]  + ai1 * b[9]  + ai2 * b[10] + ai3 * b[11];
            e[i+12] = ai0 * b[12] + ai1 * b[13] + ai2 * b[14] + ai3 * b[15];
        }

        return this;
    }
    /**
     * Set the matrix for translation.
     * @param x The X value of a translation.
     * @param y The Y value of a translation.
     * @param z The Z value of a translation.
     * @return this
     */
    setTranslate ({ x, y, z }) {
        this.elements = new Float32Array([
           1, 0, 0, 0,
           0, 1, 0, 0,
           0, 0, 1, 0,
           x, y, z, 1
        ]);
        return this;
    }
    translate ({ x, y, z }) {
        let { elements: e } = this;
        this.elements = new Float32Array([
            e[0],                                    e[1],                                    e[2],                                    e[3],
            e[4],                                    e[5],                                    e[6],                                    e[7],
            e[8],                                    e[9],                                    e[10],                                   e[11],
            e[12] + e[0] * x + e[4] * y + e[8]  * z, e[13] + e[1] * x + e[5] * y + e[9]  * z, e[14] + e[2] * x + e[6] * y + e[10] * z, e[15] + e[3] * x + e[7] * y + e[11] * z
        ]);
        return this;
    }
    /**
     * Set the matrix for scaling.
     * @param x The scale factor along the X axis
     * @param y The scale factor along the Y axis
     * @param z The scale factor along the Z axis
     * @return this
     */
    setScale ({ x, y, z }) {
        this.elements = new Float32Array([
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        ]);
        return this;
    }
    scale ({ x, y, z }) {
        let { elements: e } = this;
        this.elements = new Float32Array([
            e[0]*x, e[1]*x, e[2]*x, e[3]*x,
            e[4]*y, e[5]*y, e[6]*y, e[7]*y,
            e[8]*z, e[9]*z, e[10]*z, e[11]*z,
            e[12],   e[13],   e[14],   e[15],
        ]);
        return this;
    }
}
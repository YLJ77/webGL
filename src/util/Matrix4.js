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
        let i, e, a, b, ai0, ai1, ai2, ai3;

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
    multiply(other) {
        this.concat(other);
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
    /**
     * Set the viewing matrix.
     * @param eyeX, eyeY, eyeZ The position of the eye point.
     * @param lookAtX, lookAtY, lookAtZ The position of the reference point.
     * @param upX, upY, upZ The direction of the up vector.
     * @return this
     */
    setLookAt (eyeX, eyeY, eyeZ, lookAtX, lookAtY, lookAtZ, upX, upY, upZ) {
        let e, fx, fy, fz, rlf, sx, sy, sz, rls, ux, uy, uz;

        fx = lookAtX - eyeX;
        fy = lookAtY - eyeY;
        fz = lookAtZ - eyeZ;

        // Normalize f.
        rlf = 1 / Math.sqrt(fx*fx + fy*fy + fz*fz);
        fx *= rlf;
        fy *= rlf;
        fz *= rlf;

        // Calculate cross product of f and up.
        sx = fy * upZ - fz * upY;
        sy = fz * upX - fx * upZ;
        sz = fx * upY - fy * upX;

        // Normalize s.
        rls = 1 / Math.sqrt(sx*sx + sy*sy + sz*sz);
        sx *= rls;
        sy *= rls;
        sz *= rls;

        // Calculate cross product of s and f.
        ux = sy * fz - sz * fy;
        uy = sz * fx - sx * fz;
        uz = sx * fy - sy * fx;

        // Set to this.
        e = this.elements;
        e[0] = sx;
        e[1] = ux;
        e[2] = -fx;
        e[3] = 0;

        e[4] = sy;
        e[5] = uy;
        e[6] = -fy;
        e[7] = 0;

        e[8] = sz;
        e[9] = uz;
        e[10] = -fz;
        e[11] = 0;

        e[12] = 0;
        e[13] = 0;
        e[14] = 0;
        e[15] = 1;

        // Translate.
        return this.translate({ x: -eyeX, y: -eyeY, z: -eyeZ });
    }

    /**
     * Multiply the viewing matrix from the right.
     * @param eyeX, eyeY, eyeZ The position of the eye point.
     * @param lookAtX, lookAtY, lookAtZ The position of the reference point.
     * @param upX, upY, upZ The direction of the up vector.
     * @return this
     */
    lookAt (eyeX, eyeY, eyeZ, lookAtX, lookAtY, lookAtZ, upX, upY, upZ) {
        return this.concat(new Matrix4().setLookAt(eyeX, eyeY, eyeZ, lookAtX, lookAtY, lookAtZ, upX, upY, upZ));
    }
    /**
     * Set the orthographic projection matrix.
     * @param left The coordinate of the left of clipping plane.
     * @param right The coordinate of the right of clipping plane.
     * @param bottom The coordinate of the bottom of clipping plane.
     * @param top The coordinate of the top top clipping plane.
     * @param near The distances to the nearer depth clipping plane. This value is minus if the plane is to be behind the viewer.
     * @param far The distances to the farther depth clipping plane. This value is minus if the plane is to be behind the viewer.
     * @return this
     */
    setOrtho (left, right, bottom, top, near, far) {
        var e, rw, rh, rd;

        if (left === right || bottom === top || near === far) {
            throw 'null frustum';
        }

        rw = 1 / (right - left);
        rh = 1 / (top - bottom);
        rd = 1 / (far - near);

        e = this.elements;

        e[0]  = 2 * rw;
        e[1]  = 0;
        e[2]  = 0;
        e[3]  = 0;

        e[4]  = 0;
        e[5]  = 2 * rh;
        e[6]  = 0;
        e[7]  = 0;

        e[8]  = 0;
        e[9]  = 0;
        e[10] = -2 * rd;
        e[11] = 0;

        e[12] = -(right + left) * rw;
        e[13] = -(top + bottom) * rh;
        e[14] = -(far + near) * rd;
        e[15] = 1;

        return this;
    }
}
import { TextOperation, cpLen } from './TextOperation';
import type { Component } from './TextOperation';

// transform(a, b) -> [a', b']. При вставках в одну позицию левее оказывается `a`.
// `a` — всегда та операция, что раньше получила версию на сервере.
export function transform(a: TextOperation, b: TextOperation): [TextOperation, TextOperation] {
    if (a.baseLength !== b.baseLength) throw new Error('transform: разные документы');
    const a2 = new TextOperation();
    const b2 = new TextOperation();
    const A = a.ops;
    const B = b.ops;
    let i = 0;
    let j = 0;
    let ca: Component | undefined = A[i++];
    let cb: Component | undefined = B[j++];

    while (ca !== undefined || cb !== undefined) {
        if (typeof ca === 'string') {
            a2.insert(ca);
            b2.retain(cpLen(ca));
            ca = A[i++];
            continue;
        }
        if (typeof cb === 'string') {
            a2.retain(cpLen(cb));
            b2.insert(cb);
            cb = B[j++];
            continue;
        }
        if (ca === undefined || cb === undefined) throw new Error('transform: операция короче');

        const x = ca as number;
        const y = cb as number;
        let min: number;
        if (x > 0 && y > 0) {          // retain / retain
            min = Math.min(x, y);
            a2.retain(min);
            b2.retain(min);
        } else if (x < 0 && y < 0) {   // delete / delete
            min = Math.min(-x, -y);
        } else if (x < 0) {            // delete / retain
            min = Math.min(-x, y);
            a2.delete(min);
        } else {                       // retain / delete
            min = Math.min(x, -y);
            b2.delete(min);
        }

        const nx: number = x > 0 ? x - min : x + min;
        const ny: number = y > 0 ? y - min : y + min;
        ca = nx === 0 ? A[i++] : nx;
        cb = ny === 0 ? B[j++] : ny;
    }
    return [a2, b2];
}
// Операция = список компонентов:
//   число > 0 — оставить n символов, число < 0 — удалить |n|, строка — вставить.
// Длина считается в кодовых точках (Array.from), как mb_strlen в PHP.
export type Component = number | string;

export const cpLen = (s: string): number => Array.from(s).length;
const cpSlice = (s: string, from: number, to?: number): string =>
    Array.from(s).slice(from, to).join('');

const isRetain = (c: Component | undefined): c is number => typeof c === 'number' && c > 0;
const isDelete = (c: Component | undefined): c is number => typeof c === 'number' && c < 0;
const isInsert = (c: Component | undefined): c is string => typeof c === 'string';

export class TextOperation {
    ops: Component[] = [];
    baseLength = 0;
    targetLength = 0;

    retain(n: number): this {
        if (n === 0) return this;
        this.baseLength += n;
        this.targetLength += n;
        const last = this.ops[this.ops.length - 1];
        if (isRetain(last)) this.ops[this.ops.length - 1] = last + n; // склеиваем соседние
        else this.ops.push(n);
        return this;
    }

    insert(s: string): this {
        if (s === '') return this;
        this.targetLength += cpLen(s);
        const last = this.ops[this.ops.length - 1];
        if (isInsert(last)) this.ops[this.ops.length - 1] = last + s;
        else this.ops.push(s);
        return this;
    }

    delete(n: number): this {
        if (n === 0) return this;
        const len = Math.abs(n);
        this.baseLength += len;
        const last = this.ops[this.ops.length - 1];
        if (isDelete(last)) this.ops[this.ops.length - 1] = last - len;
        else this.ops.push(-len);
        return this;
    }

    isNoop(): boolean {
        return this.ops.length === 0 || (this.ops.length === 1 && isRetain(this.ops[0]));
    }

    toJSON(): Component[] {
        return this.ops;
    }

    static fromJSON(ops: Component[]): TextOperation {
        const o = new TextOperation();
        for (const c of ops) {
            if (typeof c === 'string') o.insert(c);
            else if (!Number.isInteger(c) || c === 0) throw new Error('Bad component');
            else if (c > 0) o.retain(c);
            else o.delete(c);
        }
        return o;
    }

    // Применить операцию к тексту
    apply(doc: string): string {
        const chars = Array.from(doc);
        if (chars.length !== this.baseLength) throw new Error('Длина документа не совпадает с операцией');
        let pos = 0;
        let out = '';
        for (const c of this.ops) {
            if (isInsert(c)) out += c;
            else if (isRetain(c)) {
                out += chars.slice(pos, pos + c).join('');
                pos += c;
            } else pos += -c;
        }
        return out;
    }

    // Склеить «эта операция, затем other» в одну (нужно для буфера клиента)
    compose(other: TextOperation): TextOperation {
        if (this.targetLength !== other.baseLength) throw new Error('compose: длины не стыкуются');
        const result = new TextOperation();
        const a = this.ops;
        const b = other.ops;
        let i = 0;
        let j = 0;
        let ca: Component | undefined = a[i++];
        let cb: Component | undefined = b[j++];
        while (ca !== undefined || cb !== undefined) {
            if (isDelete(ca)) { result.delete(ca); ca = a[i++]; continue; }
            if (isInsert(cb)) { result.insert(cb); cb = b[j++]; continue; }
            if (ca === undefined || cb === undefined) throw new Error('compose: операция короче');

            if (isRetain(ca) && isRetain(cb)) {
                const m = Math.min(ca, cb);
                result.retain(m);
                ca = ca === m ? a[i++] : ca - m;
                cb = cb === m ? b[j++] : cb - m;
            } else if (isInsert(ca) && isDelete(cb)) {
                const m = Math.min(cpLen(ca), -cb); // вставили и тут же удалили
                ca = cpLen(ca) === m ? a[i++] : cpSlice(ca, m);
                cb = -cb === m ? b[j++] : cb + m;
            } else if (isInsert(ca) && isRetain(cb)) {
                const m = Math.min(cpLen(ca), cb);
                result.insert(cpSlice(ca, 0, m));
                ca = cpLen(ca) === m ? a[i++] : cpSlice(ca, m);
                cb = cb === m ? b[j++] : cb - m;
            } else if (isRetain(ca) && isDelete(cb)) {
                const m = Math.min(ca, -cb);
                result.delete(m);
                ca = ca === m ? a[i++] : ca - m;
                cb = -cb === m ? b[j++] : cb + m;
            }
        }
        return result;
    }

    // Куда сдвинется курсор (индекс в кодовых точках) после операции
    transformIndex(index: number): number {
        let out = index;
        let pos = 0;
        for (const c of this.ops) {
            if (pos >= index) break;
            if (isRetain(c)) pos += c;
            else if (isInsert(c)) out += cpLen(c);
            else {
                out -= Math.min(-c, index - pos);
                pos += -c;
            }
        }
        return out;
    }

    // Операция «from → to»: общий префикс и суффикс остаются, середина заменяется
    static diff(from: string, to: string): TextOperation {
        const a = Array.from(from);
        const b = Array.from(to);
        let start = 0;
        const min = Math.min(a.length, b.length);
        while (start < min && a[start] === b[start]) start++;
        let endA = a.length;
        let endB = b.length;
        while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
            endA--;
            endB--;
        }
        return new TextOperation()
            .retain(start)
            .delete(endA - start)
            .insert(b.slice(start, endB).join(''))
            .retain(a.length - endA);
    }
}
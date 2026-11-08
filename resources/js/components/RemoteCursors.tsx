import { useEffect, useRef } from 'react';
import type { Cursor, Member } from '../hooks/usePresence';

const COLORS = ['#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4', '#008080'];
export const colorOf = (id: number) => COLORS[id % COLORS.length];

// Прозрачная копия текста поверх textarea: рисует каретки и выделения других людей
export default function RemoteCursors({ text, cursors, members, scrollTop, boxStyle }: {
    text: string;
    cursors: Record<number, Cursor>;
    members: Member[];
    scrollTop: number;
    boxStyle: React.CSSProperties;
}) {
    const ref = useRef<HTMLDivElement>(null);

    // синхронизируем прокрутку со своей textarea
    useEffect(() => {
        if (ref.current) ref.current.scrollTop = scrollTop;
    });

    const chars = Array.from(text);

    return (
        <>
            {Object.entries(cursors).map(([id, cur]) => {
                const m = members.find((x) => x.id === Number(id));
                if (!m) return null;

                const s = Math.min(cur.start, chars.length);
                const e = Math.min(cur.end, chars.length);
                const color = colorOf(m.id);

                return (
                    <div
                        key={id}
                        ref={ref}
                        aria-hidden
                        style={{
                            ...boxStyle,
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            color: 'transparent',
                            pointerEvents: 'none',
                            overflowY: 'scroll',
                            scrollbarColor: 'transparent transparent',
                        }}
                    >
                        {chars.slice(0, s).join('')}
                        {e > s && (
                            <mark style={{ background: color + '55', color: 'transparent' }}>
                                {chars.slice(s, e).join('')}
                            </mark>
                        )}
                        <span style={{ position: 'relative', borderLeft: `2px solid ${color}`, marginLeft: -1 }}>
                            <span
                                style={{
                                    position: 'absolute',
                                    top: '-1.3em',
                                    left: 0,
                                    background: color,
                                    color: '#fff',
                                    fontSize: 10,
                                    padding: '0 3px',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {m.name}
                            </span>
                        </span>
                        {chars.slice(e > s ? e : s).join('')}
                    </div>
                );
            })}
        </>
    );
}
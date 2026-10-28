export default function Doc({ { document } : {document: {title: string, content: string | null}}) {
    return (
        <div>
            <h1>{document.title}</h1>
            <p>{document.content}</p>
        </div>
    );
 }
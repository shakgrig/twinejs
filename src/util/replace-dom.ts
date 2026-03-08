export function replaceDom(html: string) {
	// Blast JS globals.

	delete (globalThis as any).CodeMirror;
	delete (globalThis as any).SVG;
	delete (globalThis as any).Store;
	delete (globalThis as any).StoryFormat;
	delete (globalThis as any).amdDefine;
	delete (globalThis as any).app;
	delete (globalThis as any).jQuery;

	// Rewrite the document.

	const parsed = new DOMParser().parseFromString(html, 'text/html');
	const headNodes = Array.from(parsed.head.childNodes, node =>
		document.importNode(node, true)
	);
	const bodyNodes = Array.from(parsed.body.childNodes, node =>
		document.importNode(node, true)
	);

	document.title = parsed.title;
	document.head.replaceChildren(...headNodes);
	document.body.replaceChildren(...bodyNodes);

	// Reinsert scripts so they execute. Scripts inserted via innerHTML/DOMParser
	// are inert by default.

	const scripts = Array.from(document.querySelectorAll('script'));

	scripts.forEach(script => {
		const executableScript = document.createElement('script');

		Array.from(script.attributes).forEach(attribute => {
			executableScript.setAttribute(attribute.name, attribute.value);
		});

		executableScript.textContent = script.textContent;
		script.replaceWith(executableScript);
	});
}

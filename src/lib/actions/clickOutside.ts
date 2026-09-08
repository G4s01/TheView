export function clickOutside(node: HTMLElement, options: (() => void) | { enabled: boolean; handler: () => void; ignore?: string }) {
	let handler: () => void;
	let enabled = false;
	let attached = false;
	let ignoreSelector: string | undefined;

	const onClick = (event: MouseEvent) => {
		if (enabled && node && !node.contains(event.target as Node) && !event.defaultPrevented) {
			if (ignoreSelector && (event.target as Element).closest?.(ignoreSelector)) {
				return;
			}
			handler();
		}
	};

	function processOptions(opt: any) {
		if (typeof opt === 'function') {
			handler = opt;
			enabled = true;
			ignoreSelector = undefined;
		} else {
			handler = opt.handler;
			enabled = opt.enabled !== false;
			ignoreSelector = opt.ignore;
		}
		
		if (enabled && !attached) {
			document.addEventListener('click', onClick, true);
			attached = true;
		} else if (!enabled && attached) {
			document.removeEventListener('click', onClick, true);
			attached = false;
		}
	}
	
	processOptions(options);

	return {
		update(newOptions: any) {
			processOptions(newOptions);
		},
		destroy() {
			if (attached) {
				document.removeEventListener('click', onClick, true);
			}
		}
	};
}

export function clickOutside(
  node: HTMLElement,
  options:
    | (() => void)
    | { enabled: boolean; handler: () => void; ignore?: string },
) {
  let handler: () => void;
  let enabled = false;
  let attached = false;
  let ignoreSelector: string | undefined;

  const onClick = (event: MouseEvent) => {
    if (
      enabled &&
      node &&
      !node.contains(event.target as Node) &&
      !event.defaultPrevented
    ) {
      const target = event.target as Element;
      // Ignore clicks on elements that were detached from the DOM (e.g. popover items that unmount on click)
      if (!document.contains(target)) {
        return;
      }

      // Ignore clicks on portalled Popover/floating content (rendered outside the component DOM by bits-ui Portal)
      if (
        target.closest?.('[data-slot="popover-content"]') ||
        target.closest?.("[data-bits-popover-content]") ||
        target.closest?.("[data-bits-combobox-content]") ||
        target.closest?.("[data-bits-dialog-overlay]") ||
        target.closest?.("[data-bits-dialog-content]")
      ) {
        return;
      }
      if (ignoreSelector && target.closest?.(ignoreSelector)) {
        return;
      }
      handler();
    }
  };

  function processOptions(opt: any) {
    if (typeof opt === "function") {
      handler = opt;
      enabled = true;
      ignoreSelector = undefined;
    } else {
      handler = opt.handler;
      enabled = opt.enabled !== false;
      ignoreSelector = opt.ignore;
    }

    if (enabled && !attached) {
      document.addEventListener("click", onClick, true);
      attached = true;
    } else if (!enabled && attached) {
      document.removeEventListener("click", onClick, true);
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
        document.removeEventListener("click", onClick, true);
      }
    },
  };
}

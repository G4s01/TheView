import { render } from "svelte/server";
import ConfirmDeleteButton from "./src/lib/components/ui/ConfirmDeleteButton.svelte";

try {
  const result = render(ConfirmDeleteButton, {
    props: {
      onConfirm: () => console.log("confirmed"),
      class: "w-10 h-10",
    },
  });
  console.log(result.html);
} catch (e) {
  console.error("Render error:", e);
}

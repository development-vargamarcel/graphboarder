import { Dialog as DialogPrimitive } from "bits-ui";

import Content from "./dialog-content.svelte";
import Description from "./dialog-description.svelte";
import Footer from "./dialog-footer.svelte";
import Header from "./dialog-header.svelte";
import Overlay from "./dialog-overlay.svelte";
import Portal from "./dialog-portal.svelte";
import Title from "./dialog-title.svelte";
import Root from "./dialog.svelte";

const Trigger = DialogPrimitive.Trigger;
const Close = DialogPrimitive.Close;

export {
	Root,
	Trigger,
	Content,
	Description,
	Footer,
	Header,
	Overlay,
	Portal,
	Title,
	Close,
	//
	Root as Dialog,
	Trigger as DialogTrigger,
	Content as DialogContent,
	Description as DialogDescription,
	Footer as DialogFooter,
	Header as DialogHeader,
	Overlay as DialogOverlay,
	Portal as DialogPortal,
	Title as DialogTitle,
	Close as DialogClose,
};

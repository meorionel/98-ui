import { defineComponent, h, useAttrs, type PropType } from "vue";
import { useI18n, type MessageKey, type MessageVars } from "./index";
import { renderInline } from "./inline";

/**
 * Renders a message that may contain `` `code` ``, `**strong**`, `*emphasis*`
 * and `[links](url)` spans.
 *
 * Use this instead of `t()` for any prose containing inline markup.
 *
 * ```vue
 * <T k="panels.fieldBorders.p1" as="p" />
 * <blockquote><T k="forms.button.quote" /></blockquote>
 * ```
 *
 * `as` is an element name (`"p"`, `"li"`); without it the message is rendered
 * as a bare fragment so `<T>` can be dropped inside existing markup.
 */
export const T = defineComponent({
	name: "T",
	inheritAttrs: false,
	props: {
		/** Message key to render. */
		k: { type: String as PropType<MessageKey>, required: true },
		vars: { type: Object as PropType<MessageVars>, default: undefined },
		/** Optional wrapper element — usually `"p"` or `"li"`. */
		as: { type: String as PropType<string>, default: undefined },
	},
	setup(props) {
		const { t } = useI18n();
		const attrs = useAttrs();

		return () => {
			const content = renderInline(t(props.k, props.vars));
			return props.as ? h(props.as, { class: attrs.class }, content) : content;
		};
	},
});

import {
	forwardRef,
	useState,
	type CSSProperties,
	type HTMLAttributes,
	type ReactNode,
} from "react";
import { cx } from "../utils/cx";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
	/** Image URL. When it is missing or fails to load, `fallback` is shown. */
	src?: string;
	/** Alt text for the image. A decorative avatar can pass `""`. */
	alt?: string;
	/** Content used when there is no image: usually initials. */
	fallback?: ReactNode;
	/** Pixel size. Defaults to `32`. */
	size?: number;
	/** Windows 98 tiles are square; `"circle"` is there for modern layouts. */
	shape?: "square" | "circle";
}

/**
 * A user tile.
 *
 * ```tsx
 * <Avatar src="/me.png" alt="Meorion" fallback="MO" />
 * ```
 *
 * Modelled on the Windows 98 logon tiles: a sunken square with the picture
 * inside. If the image is missing — or errors while loading, which is the case
 * that matters — the `fallback` (initials, typically) is rendered instead.
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
	{ src, alt = "", fallback, size = 32, shape = "square", className, style, ...rest },
	ref,
) {
	const [failed, setFailed] = useState(false);
	const showImage = src !== undefined && src !== "" && !failed;

	return (
		<span
			ref={ref}
			className={cx("avatar", shape === "circle" && "avatar-circle", className)}
			style={{ "--avatar-size": `${size}px`, ...style } as CSSProperties}
			{...rest}
		>
			{showImage ? (
				<img
					className="avatar-image"
					src={src}
					alt={alt}
					width={size}
					height={size}
					onError={() => setFailed(true)}
				/>
			) : (
				fallback !== undefined && <span className="avatar-fallback">{fallback}</span>
			)}
		</span>
	);
});

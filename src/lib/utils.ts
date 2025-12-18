import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function renderMarkdown(markdown: string) {
	const blocks = markdown.trim().split(/\n{2,}/);

	return blocks
		.map((block) => {
			const lines = block.split('\n').filter((line) => line.trim().length > 0);
			const isList = lines.length > 0 && lines.every((line) => /^[-*]\s+/.test(line.trim()));

			if (isList) {
				const items = lines
					.map((line) => line.trim().replace(/^[-*]\s+/, ''))
					.map((line) => `<li>${renderInlineMarkdown(line)}</li>`)
					.join('');

				return `<ul>${items}</ul>`;
			}

			return `<p>${lines.map((line) => renderInlineMarkdown(line.trim())).join('<br>')}</p>`;
		})
		.join('');
}

function renderInlineMarkdown(markdown: string) {
	const codeSegments: string[] = [];
	let html = escapeHtml(markdown).replace(/`([^`]+)`/g, (_, code: string) => {
		const token = `@@CODE_${codeSegments.length}@@`;
		codeSegments.push(`<code>${code}</code>`);
		return token;
	});

	html = html
		.replace(/\[([^\]]+)\]\(((?:[^()]|\([^)]*\))+)\)/g, (_, text: string, href: string) => {
			const safeHref = sanitizeHref(href);
			if (!safeHref) return text;

			return `<a href="${safeHref}" target="_blank" rel="noreferrer">${text}</a>`;
		})
		.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
		.replace(/__([^_]+)__/g, '<strong>$1</strong>')
		.replace(/\*([^*]+)\*/g, '<em>$1</em>')
		.replace(/_([^_]+)_/g, '<em>$1</em>');

	for (const [index, code] of codeSegments.entries()) {
		html = html.replace(`@@CODE_${index}@@`, code);
	}

	return html;
}

function escapeHtml(value: string) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function sanitizeHref(value: string) {
	const href = value.trim();

	if (/^(https?:|mailto:|tel:)/i.test(href)) {
		return href.replace(/"/g, '&quot;');
	}

	return '';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

import { describe, expect, it } from 'vitest';
import { cn, renderMarkdown } from '#lib/utils.js';

describe('cn', () => {
	it('joins conditional class names', () => {
		const isHidden = false;

		expect(cn('inline-flex', isHidden && 'hidden', ['items-center', 'gap-2'])).toBe(
			'inline-flex items-center gap-2'
		);
	});

	it('merges conflicting tailwind classes with the last value winning', () => {
		expect(cn('px-2 py-1 text-sm', 'px-4 text-lg')).toBe('py-1 px-4 text-lg');
	});
});

describe('renderMarkdown', () => {
	it('renders paragraphs, bold text, and unordered lists', () => {
		const markdown = [
			'Người dùng có tên **Bench-8-98**:',
			'',
			'- **Họ và tên:** Bench-8-98 Vu-8',
			'- **Email:** k6-user+1777512754384.vu8.n1@example.com',
			'- **Số điện thoại:** 0900080098'
		].join('\n');

		expect(renderMarkdown(markdown)).toBe(
			'<p>Người dùng có tên <strong>Bench-8-98</strong>:</p><ul><li><strong>Họ và tên:</strong> Bench-8-98 Vu-8</li><li><strong>Email:</strong> k6-user+1777512754384.vu8.n1@example.com</li><li><strong>Số điện thoại:</strong> 0900080098</li></ul>'
		);
	});

	it('escapes html before rendering markdown', () => {
		const markdown = '**Name:** <script>alert("x")</script>';

		expect(renderMarkdown(markdown)).toBe(
			'<p><strong>Name:</strong> &lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;</p>'
		);
	});

	it('does not render unsafe links', () => {
		expect(renderMarkdown('[bad](javascript:alert(1)) and [ok](https://example.com)')).toBe(
			'<p>bad and <a href="https://example.com" target="_blank" rel="noreferrer">ok</a></p>'
		);
	});
});

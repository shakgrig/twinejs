import * as React from 'react';
import {useParams} from 'react-router';
import {replaceDom} from '../../util/replace-dom';
import {usePublishing} from '../../store/use-publishing';
import {ErrorMessage} from '../../components/error';

const macroRegistrationCompatShim = [
	'(function () {',
	"\tif (globalThis.__twineMacroCompatInstalled) { return; }",
	'\tglobalThis.__twineMacroCompatInstalled = true;',
	'\tvar originalDefineProperty = Object.defineProperty;',
	'\tfunction normalizeDescriptor(propertyKey, descriptor) {',
	'\t\tvar value = descriptor && descriptor.value;',
	"\t\tif (!value || typeof value !== 'object') {",
	'\t\t\treturn descriptor;',
	'\t\t}',
	"\t\tif (!('returnType' in value) || !('fn' in value) || !('typeSignature' in value)) {",
	'\t\t\treturn descriptor;',
	'\t\t}',
	'\t\tvar normalizedKey = String(propertyKey || "").toLowerCase();',
	"\t\tvar looksShifted = typeof value.returnType === 'function' && typeof value.fn !== 'function';",
	'\t\tvar fixedValue = value;',
	'\t\tif (looksShifted) {',
	"\t\t\tvar inferredType = typeof value.typeSignature === 'string' ? value.typeSignature : 'Any';",
	"\t\t\tvar inferredSignature = Array.isArray(value.fn) ? value.fn : Array.isArray(value.typeSignature) ? value.typeSignature : [];",
	'\t\t\tfixedValue = Object.assign({}, value, {',
	'\t\t\t\treturnType: inferredType,',
	'\t\t\t\tfn: value.returnType,',
	'\t\t\t\ttypeSignature: inferredSignature',
	'\t\t\t});',
	'\t\t}',
	"\t\tif (typeof fixedValue.returnType !== 'string') {",
	"\t\t\tfixedValue = Object.assign({}, fixedValue, {returnType: 'Any'});",
	'\t\t}',
	'\t\tif (normalizedKey === "track" && (fixedValue !== value || looksShifted)) {',
	'\t\t\tvar issue = {',
	'\t\t\t\tpropertyKey: propertyKey,',
	"\t\t\t\toriginalReturnTypeType: typeof value.returnType,",
	"\t\t\t\toriginalFnType: typeof value.fn,",
	"\t\t\t\tfixedReturnTypeType: typeof fixedValue.returnType,",
	"\t\t\t\tfixedFnType: typeof fixedValue.fn,",
	"\t\t\t\tstack: (new Error('[Twine debug compat] Repaired malformed macro registration for track')).stack",
	'\t\t\t};',
	"\t\t\tif (!globalThis.__twineMacroRegistrationIssues) { globalThis.__twineMacroRegistrationIssues = []; }",
	'\t\t\tglobalThis.__twineMacroRegistrationIssues.push(issue);',
	"\t\t\tconsole.warn('[Twine debug compat] repaired malformed macro registration', issue);",
	'\t\t}',
	'\t\tif (fixedValue === value) {',
	'\t\t\treturn descriptor;',
	'\t\t}',
	'\t\treturn Object.assign({}, descriptor, {value: fixedValue});',
	'\t}',
	'\tObject.defineProperty = function (target, propertyKey, descriptor) {',
	'\t\tvar normalizedDescriptor = descriptor;',
	'\t\ttry {',
	'\t\t\tnormalizedDescriptor = normalizeDescriptor(propertyKey, descriptor);',
	'\t\t} catch (error) {',
	"\t\t\tconsole.warn('[Twine debug compat] failed while normalizing macro registration', error);",
	'\t\t}',
	'\t\treturn originalDefineProperty.call(Object, target, propertyKey, normalizedDescriptor);',
	'\t};',
	'})();'
].join('');

function injectMacroRegistrationCompatShim(html: string) {
	const headOpenTag = /<head[^>]*>/i;
	const headOpenMatch = headOpenTag.exec(html);

	if (html.includes('data-twine-debug-compat')) {
		return html;
	}

	const script =
		`<script data-twine-debug-compat="macro-registration">` +
		macroRegistrationCompatShim +
		`</script>`;

	if (headOpenMatch && typeof headOpenMatch.index === 'number') {
		const insertionIndex = headOpenMatch.index + headOpenMatch[0].length;

		return (
			html.slice(0, insertionIndex) +
			script +
			html.slice(insertionIndex)
		);
	}

	const headCloseTag = '</head>';
	const headCloseIndex = html.indexOf(headCloseTag);

	if (headCloseIndex === -1) {
		return html;
	}

	return html.slice(0, headCloseIndex) + script + html.slice(headCloseIndex);
}

export const StoryTestRoute: React.FC = () => {
	const [publishError, setPublishError] = React.useState<Error>();
	const loadedKeyRef = React.useRef<string>();
	const {passageId, storyId} = useParams<{
		passageId: string;
		storyId: string;
	}>();
	const {publishStory} = usePublishing();
	const loadKey = `${storyId ?? ''}:${passageId ?? ''}`;

	React.useEffect(() => {
		if (loadedKeyRef.current === loadKey) {
			return;
		}

		loadedKeyRef.current = loadKey;

		async function load() {
			if (!storyId) {
				setPublishError(new Error('Missing story id in route.'));
				return;
			}

			try {
				const html = await publishStory(storyId, {
					formatOptions: 'debug',
					startId: passageId
				});

				replaceDom(injectMacroRegistrationCompatShim(html));
			} catch (error) {
				setPublishError(error as Error);
			}
		}

		load();
	}, [loadKey, passageId, publishStory, storyId]);

	if (publishError) {
		return <ErrorMessage>{publishError.message}</ErrorMessage>;
	}

	return null;
};

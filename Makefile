.PHONY: publish

publish:
	bun run build
	bun test
	npm version patch
	git push --follow-tags
	npm publish

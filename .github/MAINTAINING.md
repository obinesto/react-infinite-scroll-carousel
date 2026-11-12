# Maintainer guide

## Verification

Use Node.js 24 or later.

```bash
npm ci
npm run typecheck
npm test -- --runInBand
npm run test:release
npm run build
npm run test:package
```

The package check validates packed file names, TypeScript declarations, CommonJS loading, and ESM loading.

## Stage a release from publish

The `publish.yml` workflow validates pull requests that target `publish`.
Merge a release PR into `publish` to run CI and stage the release.
The `publish` branch requires pull requests for updates.
Updates to `main` do not trigger this release workflow.
The version becomes public only after you approve it on npm with 2FA.
Tag pushes do not stage packages.
The workflow uses npm trusted publishing. It does not use an npm token.

Configure the trusted publisher in the npm package settings:

1. Select GitHub Actions as the publisher.
2. Set the owner to `obinesto`.
3. Set the repository to `react-infinite-scroll-carousel`.
4. Set the workflow filename to `publish.yml`.
5. Leave the environment name empty.
6. Leave **Allow npm publish** unchecked.
7. Leave **Allow npm dist-tag** unchecked.
8. Enable 2FA on your npm account.

`npm stage publish` is allowed without either checkbox.
The workflow cannot approve releases or change tags on existing versions.

See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/) for the setup procedure.

The workflow checks npm's `latest` tag and the published version list before selecting a release.
It also checks fetched Git tags for a target version collision.
Git tags do not override npm's version history.

For a registry with `latest` set to `1.0.6`, these rules apply:

| package.json version | Result |
| --- | --- |
| `1.0.6` | Stage `1.0.7` for approval with the `latest` tag. |
| `1.0.7` | Stage the next patch. |
| `1.1.0` | Stage the next minor release. |
| `2.0.0` | Stage the next major release. |
| `1.0.8` or `1.1.7` | Stop. The version skips a release step. |
| Older version | Stop. Update from the current `latest` version. |

npm cannot replace a published version, including the current `latest` version.
Unpublishing does not permit version reuse.
See [npm publish](https://docs.npmjs.com/cli/commands/npm-publish/) for this restriction.
The unchanged-version rule stages a new patch as the replacement release.

## Review and approve a release

1. Open the successful Actions run and read the release summary.
2. Sign in to npm and open **Staged Packages** in your account.
3. Check the package name, version, source commit, contents, and `latest` tag.
4. Approve the stage and complete 2FA to publish it.
5. Reject the stage if you do not want to publish it.

You can also review and approve through an authenticated local npm CLI:

```bash
npm stage list @obinesto/react-infinite-scroll-carousel
npm stage view <stage-id>
npm stage approve <stage-id>
```

Approval requires 2FA. CI does not perform this step.
See [npm staged publishing](https://docs.npmjs.com/staged-publishing/) for details.

Resolve pending stages before submitting another release for this package.
Pending stages reserve their version numbers but do not update the public `latest` tag.
The workflow uses public registry metadata and cannot list pending stages with its OIDC credentials.
A retry or another push can therefore encounter a staged version conflict.
Review the existing stage on npm. Approve it, or reject it before retrying.
Do not approve an older stage after a newer version becomes public.
Reject it and prepare a release from the current `latest` version instead.

## After publication

The workflow changes `package.json` and `package-lock.json` only in its build workspace.
It does not push commits or Git tags.
After publication, update both files to the published version before the next release:

```bash
npm version 1.0.7 --no-git-tag-version --ignore-scripts
```

Use the actual published version in this command.
An older source version cannot trigger another automatic patch.
The Actions summary reports the selected version and any release-policy error.
Registry, authentication, validation, and staging failures stop the release and show recovery guidance.
The workflow rechecks the public registry immediately before staging the tested tarball.
Successful staging does not mean that the version is public.
If staging succeeds but reporting fails, check npm's Staged Packages before retrying.
Rerunning a commit already published as `latest` skips publication when npm's `gitHead` matches.
External publishers can still race with CI or your approval step.
npm rejects a duplicate version instead of replacing it.

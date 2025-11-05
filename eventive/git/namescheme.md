# A Guide to Conventional Commits

Conventional Commits is a specification for adding human and machine-readable meaning to commit messages. It provides a set of rules for creating an explicit commit history, which makes it easier to write automated tools on top of.

By following this convention, you can automatically generate changelogs, easily determine semantic version bumps (based on the types of commits), and make it simpler for other developers to understand the history of your project.

## Key Components at a Glance

Here are the most important parts to remember:

* **The Format:** The header is the key: `<type>(<scope>): <description>`

* **The `type` is mandatory.** The most common types are:

  * **`feat`**: For a new feature.

  * **`fix`**: For a bug fix.

* **Breaking Changes** are critical. Mark them with `!` after the type (e.g., `feat(api)!:`) AND by adding a `BREAKING CHANGE:` section in the footer.

## The Commit Message Structure

The basic format for a Conventional Commit message is as follows:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 1. The Header

The header is the first line of the commit message and is mandatory. It consists of three parts:

#### `type` (Mandatory)

This is a word that describes the *kind* of change you are making. The most common types are:

* **feat**: A new feature (correlates with `MINOR` in semantic versioning).

* **fix**: A bug fix (correlates with `PATCH` in semantic versioning).

* **build**: Changes that affect the build system or external dependencies (e.g., npm, gulp, webpack).

* **chore**: Other changes that don't modify `src` or `test` files (e.g., updating dependencies, .gitignore).

* **ci**: Changes to CI configuration files and scripts (e.g., GitHub Actions, Travis).

* **docs**: Documentation-only changes.

* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.).

* **refactor**: A code change that neither fixes a bug nor adds a feature.

* **perf**: A code change that improves performance.

* **test**: Adding missing tests or correcting existing tests.

#### `scope` (Optional)

A noun specifying the section of the codebase the change affects. This is placed in parentheses after the type.

* `feat(api):`

* `fix(parser):`

* `docs(readme):`

#### `description` (Mandatory)

A short, imperative-tense description of the change.

* Use the imperative mood (e.g., "add" not "added", "change" not "changed").

* Do not capitalize the first letter.

* Do not add a period (`.`) at the end.

**Good Header Examples:**

* `feat: add user login endpoint`

* `fix(auth): correct password hashing algorithm`

* `docs: update installation guide`

* `chore(deps): upgrade react to v18`

### 2. The Body (Optional)

The body is used to provide more detailed context about the code change.

* Use it to explain the *what* and *why* of the change, not the *how*.

* Separate the body from the header with a single blank line.

* Like the description, use the imperative mood.

**Example with Body:**

```
fix: prevent double-submission on forms

Previously, users could click the 'Submit' button multiple times, leading to duplicate database entries.

This fix disables the button after the first click.
```

### 3. The Footer (Optional)

The footer is used to reference metadata about the commit, such as issue tracker IDs or breaking changes.

* Separate the footer from the body with a single blank line.

#### Breaking Changes

A "breaking change" is a change that introduces an API or behavior incompatibility with the previous version. It **MUST** be indicated in one of two ways:

1. **In the Footer (Preferred):** Start the footer with `BREAKING CHANGE:` (all caps), followed by a description of the change.

```
feat: implement new user authentication system

BREAKING CHANGE: The 'user.token' field is now a JWT instead of a simple string. All clients must be updated to handle the new token format.
```

2. **Using `!`:** Add an exclamation mark (`!`) after the `type(scope)` to draw attention to the breaking change. The footer must still contain the `BREAKING CHANGE:` section.

```
refactor(auth)!: rewrite token generation logic

BREAKING CHANGE: Token verification is now asynchronous and requires an 'await'.
```

A commit with a breaking change correlates with `MAJOR` in semantic versioning.

#### Referencing Issues

You can close or reference issues in the footer using specific keywords.

* `Closes #123`

* `Fixes #45, Refs #67`

* `See also: #89`

**Example with Footer:**

```
fix(api): resolve issue with user data caching

This commit flushes the user cache upon password update, ensuring that stale data is not served.

Closes #234
```

## Full Commit Examples

**Example 1: Simple Feature**

```
feat: add dark mode toggle
```

**Example 2: Fix with Scope and Issue Closing**

```
fix(styles): correct button alignment on mobile

The primary call-to-action button was off-center on screens smaller than 480px. This commit adjusts the flex-basis to ensure proper centering.

Fixes #78
```

**Example 3: Breaking Change**

```
feat(api)!: remove v1 endpoints for user data

The v1 endpoints (/api/v1/users) have been deprecated and are now fully removed.

BREAKING CHANGE: All API clients must migrate to the v2 endpoints (/api/v2/users) which use a different data structure. See the migration guide in the documentation.

Refs #102
```
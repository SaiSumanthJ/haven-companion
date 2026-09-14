# Fit instructions

One folder per setup category. One markdown file per option. Skip is not a file — choosing Skip loads nothing.

When a user picks an option, every chat request reloads that file into the system prompt. The Ollama model file does not change. `fit/personality/` is first and outranks the other categories when they conflict. A saved fact and safety still win. Personality files are longer on purpose: they are the main how-to-be-with-them note.

## Required lines in every option file

Keep each line short. Do not omit a heading.

- See:
- Never:
- Opening:
- Ordinary talk:
- Hard night:
- They correct you:
- They say no:
- They mention a real person:
- They leave:
- They go quiet:
- They return:
- Romance they start:
- Adult talk they start:
- Work, money, family, body:
- If you slip:
- A saved fact wins.

Personality files also keep:

- How they think:
- How they feel close:
- Stress:
- Conflict:
- Solitude:
- Friends and social:
- Care shown as:
- Blind spots:
- What they are not:
- What not to do:
- Identity:

## Add a category later

1. Create `fit/<category-folder>/`.
2. Add one `.md` file named after the option id.
3. Use every heading above, tailored to that option.
4. List the field in `UserFit`, setup chips, and `fitInstructions.ts`.
5. Run `npm run eval`.

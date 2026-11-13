# Prompt Master Button

Adds a Prompt Master button to the band above the prompt box. Type a rough prompt, click the button, and the mod rewrites your draft in place using the Prompt Master skill's rules (v1.6.0). Review the result and press Enter, or click Undo to restore your text. The /pm command does the same; /pm followed by text rewrites that text.

The target defaults to Claude. Name another tool in your draft (for example "for Midjourney") and the rewrite targets that tool. The button never asks questions; gaps become [PLACEHOLDERS] you fill in.

This mod installs beside the Prompt Master skill and does not replace it.

The rewrite rules come from the prompt-master skill by Nidhin Joseph Nelson, MIT license. See THIRD_PARTY_LICENSE-prompt-master-skill.

## Install

At the prompt of a terminal session:

```
/plugin install prompt-master-button --marketplace CapeGeorge/prompt-master
```

From a shell:

```
claude plugin install prompt-master-button --marketplace CapeGeorge/prompt-master
```

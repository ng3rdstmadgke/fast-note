# GitHub CLI の ログイン

```bash
gh auth login
# ? Where do you use GitHub? GitHub.com
# ? What is your preferred protocol for Git operations on this host? HTTPS
# ? Authenticate Git with your GitHub credentials? Yes
# ? How would you like to authenticate GitHub CLI? Login with a web browser
# 
# ! First copy your one-time code: XXXX-XXXX
# Press Enter to open https://github.com/login/device in your browser... 
# ✓ Authentication complete.
# - gh config set -h github.com git_protocol https
# ✓ Configured git protocol
# ! Authentication credentials saved in plain text
# ✓ Logged in as xxxxxxxxxxxxx
```

# MCPサーバー
## GitHub MCP サーバーを利用する

※ github cli (gh コマンド) がインストールされているのであまり必要ないが、参考までに

### パーソナルアクセストークンを作成
[Fine-grained personal access tokens | GitHub ](https://github.com/settings/personal-access-tokens) でトークンを作成する


### MCPサーバーの登録

https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-claude.md

```bash
GITHUB_PAT=github_pat_xxxxxxxxxxxxxxxxxxxxxx
claude mcp add \
  --transport http \
  github \
  --scope user \
  https://api.githubcopilot.com/mcp/ \
  -H "Authorization: Bearer $GITHUB_PAT"
```

## Context7 MCP サーバーを利用する

https://github.com/upstash/context7

### APIキーの取得

https://context7.com/dashboard でアカウント登録し、APIキーを取得する

### MCPサーバーの登録


```bash
CONTEXT7_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
claude mcp add \
  --transport http \
  --scope user \
  context7 \
  https://mcp.context7.com/mcp \
  --header "CONTEXT7_API_KEY: $CONTEXT7_API_KEY"
```


## DuckDuckGo MCP サーバーを利用する

https://hub.docker.com/r/mcp/duckduckgo

```bash
claude mcp add \
  --transport stdio \
  --scope project \
  duckduckgo -- docker run -i --rm mcp/duckduckgo 
```


## AWS Documentation MCP サーバーを利用する

https://hub.docker.com/r/mcp/aws-documentation

```bash
claude mcp add \
  --transport stdio \
  --scope project \
  aws-documentation -- docker run -i --rm mcp/aws-documentation
```

## AWS Terraform MCP サーバーを利用する

https://hub.docker.com/r/mcp/aws-terraform

```bash
claude mcp add \
  --transport stdio \
  --scope project \
  aws-terraform -- docker run -i --rm mcp/aws-terraform
```


# Claude Code GitHub Actions

- https://code.claude.com/docs/en/github-actions
- https://github.com/anthropics/claude-code-action

GitHub ActionsでClaude CodeがPRレビューや開発を行ってくれる機能

コマンドラインで claude codeを開き `/install-github-app` を実行

GitHub の Applications に Claude が追加されます。

https://github.com/settings/installations


### 使い方

IssueまたはPRのコメント内で：

```
@claude implement this feature based on the issue description
@claude how should I implement user authentication for this endpoint?
@claude fix the TypeError in the user dashboard component
```
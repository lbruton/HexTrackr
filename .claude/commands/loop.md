We have been using a rewind technique to retain your project context between each task. 

Our workflow is to first research and create the linear issue
then we update the linear issue with the fix and a task list

as we complete each task we will:

1. save a commit with notes about what we are going to change
2. create a new changelog file for the next available patch version (**File**: `/app/public/docs-source/changelog/index.md`)
3. bump the version of the application to match the new patch version
2. save a markdown file in the root of the project (use .rewindlog_issue_phaseortask.md) after each session is complete.
5. Complete updates to changelog file
6. Complete updates to the Linear Issue (Mark as Complete)
3. then rewind for the implementation phase. 

If we need more context than a single chat session will provide we will break the task down into small chunks 

This workflow ensures: 

1. we always have the primed context you loaded at the start  
2. we can conserve tokens by re-using the session context
3. The rewind log file ensures that you have a clean handoff between each task after the chat rewind. 

Required MCP Tools for this session:

1. Sequential Thinking (Break Down Complex Tasks)
2. Claude-Context (Semantic Search of All Code and Markdown Files in the Project)
3. Memento (Semantic Search of Insights and Saved Conversations, Institutional Knowledge Graph)
4. Linear-Server (Issue and Project Task Lilsts)

**You may use subagents to deligate tasks to conserve tokens in the chat session**

Standby for Promp:

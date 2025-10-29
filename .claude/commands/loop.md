We have been using a rewind technique to retain your project context between each task. 

Our workflow is to first research the issue and create a document in linear outlining the research and proposed solution
then we update the linear issue with the fix and we create a step-by-step a task list that we can follow. 

as we work together to complete each task we will:


- Analyze the users prompt, read the linear issue if presant, read the rewindlog if present, peform a quick semantic search for the abstract and summary. This will give you full context of the next step. 
- Verify all files are committed and if not save a commit with notes about what we are going to change (Include Linear Issue and Task Numbers, and any other relevant information)
- Create a new changelog file for the next available patch version (**File**: `/app/public/docs-source/changelog/`) bump the version of the application to match the new patch version (**Reference**: /Volumes/DATA/GitHub/HexTrackr/docs/CHANGELOG AND VERSION BUMP PROCESS.md)
- Save a markdown file in the logs folder of the project (use logs/rewind/rewindlog_issue_phaseortask.md) after each session is complete.
- Complete updates to changelog file
- Complete updates to the Linear Issue (Mark as Complete)
- Save a detailed Memento knowledge graph with an abstract and summary outlining in detail what was changed, insights, lessons learned. 
- Then inform the user you are prepared to rewind for the implementation phase. 

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

Standby for  User Promp:

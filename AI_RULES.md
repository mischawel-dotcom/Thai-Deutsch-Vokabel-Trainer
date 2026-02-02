\- Project is a Thai–German vocabulary trainer

\- Prefer simple JS/TS

\- No frameworks unless requested

\- Focus on learning logic, not UI polish

- Do NOT make any changes without explicit user request and confirmation
## Development Workflow

**ALWAYS follow this process when making changes:**

1. **Develop & Test Locally**
   - Use `npm run dev -- --host 0.0.0.0` during development
   - Actively test changes as you make them
   - **WAIT FOR USER CONFIRMATION** that testing is complete before proceeding

2. **Preview Build Test**
   - Run `npm run preview -- --host 0.0.0.0` before committing
   - Ensure the production build works correctly
   - **WAIT FOR USER CONFIRMATION** that everything works before proceeding

3. **Commit to Git**
   - Only commit after both dev and preview testing pass
   - Use clear, descriptive commit messages

4. **Push to GitHub**
   - **ONLY PUSH AFTER USER EXPLICITLY CONFIRMS TESTING IS COMPLETE**
   - Push only tested, stable code
   - Never skip any testing steps

⚠️ **CRITICAL**: Do NOT push to GitHub until user has manually tested the changes and given explicit approval!

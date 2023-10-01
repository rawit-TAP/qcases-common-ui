# Intro
Common utils and ui component for building frontend
# Pre-requisites
- Nodejs: https://nodejs.org/en/download/package-manager/
# Build project
- Install dependencies: npm i
- Run: npm run build
# Publish to the qcases organization
- Login to npmjs from cli: npm login
- Test if successfully logged in: npm whoami
- Publish package: npm publish --access public
- Login to npmjs on browser and check in the organzation:
    https://www.npmjs.com/settings/qcases/packages

NOTE: need to run build before publish

# Install to test in different repo
- Copy absolute path of root folder
- Install to consuming repo using: `npm i <absolutePath>`
Example: `npm i /Users/john/Desktop/Projects/qcases-common-ui`

# Notes
To avoid error multiple react instances (only for testing lib on LOCAL), example error log on browser console:
`Cannot read properties of null (reading 'useMemo')`
Ref: https://stackoverflow.com/questions/56021112/react-hooks-in-react-library-giving-invalid-hook-call-error`
- In Your Application:
    - `cd node_modules/react && npm link`
    - `cd node_modules/react-dom && npm link`

- In Local Library root folder, for example @qcases/common-ui:
    - `npm link react`
    - `npm link react-dom`

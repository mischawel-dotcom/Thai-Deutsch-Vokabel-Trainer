#!/usr/bin/env sh

# Build the project
npm run build

# Navigate into the build output directory
cd dist

# Create .nojekyll to bypass Jekyll processing
echo > .nojekyll

# Initialize git if needed
git init
git add -A
git commit -m 'Deploy to GitHub Pages'

# Push to gh-pages branch
git push -f git@github.com:mischawel-dotcom/Thai-Deutsch-Vokabel-Trainer.git main:gh-pages

cd -

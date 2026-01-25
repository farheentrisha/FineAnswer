# Git Workflow Guide for FineAnswer Project

## Table of Contents
1. [Two Workflow Options](#two-workflow-options)
2. [Option 1: Direct Push to Main](#option-1-direct-push-to-main)
3. [Option 2: Branch Workflow (Recommended)](#option-2-branch-workflow-recommended)
4. [When to Use `git pull`](#when-to-use-git-pull)
5. [Common Scenarios & Solutions](#common-scenarios--solutions)
6. [Best Practices](#best-practices)

---

## Two Workflow Options

You have two ways to work with Git:

### Option 1: Direct Push to Main
- **When to use:** Quick fixes, small changes, you're the only one working
- **Pros:** Fast, simple, no extra steps
- **Cons:** No review process, risk of breaking main branch

### Option 2: Branch Workflow (Recommended)
- **When to use:** New features, major changes, team collaboration
- **Pros:** Safe, reviewable, can test before merging
- **Cons:** Extra steps (create branch, PR, merge)

---

## Option 1: Direct Push to Main

### Workflow Steps

```bash
# 1. Make sure you're on main branch
git checkout main

# 2. Pull latest changes (IMPORTANT - do this first!)
git pull origin main

# 3. Make your changes to files
# (edit files in your editor)

# 4. Check what changed
git status

# 5. Add your changes
git add .

# 6. Commit with a clear message
git commit -m "Add feature: description of what you did"

# 7. Push to main
git push origin main
```

### ⚠️ Important: Always Pull First!

**Before pushing, ALWAYS pull first:**
```bash
git pull origin main
```

This ensures you have the latest code and prevents conflicts.

### Will There Be Problems?

**Yes, if you don't pull first!** Here's what can happen:

1. **If someone else pushed to main:**
   ```bash
   # You try to push
   git push origin main
   
   # Error: rejected (non-fast-forward)
   # Solution: Pull first, then push
   git pull origin main
   git push origin main
   ```

2. **If you have uncommitted changes:**
   ```bash
   # Error: You have uncommitted changes
   # Solution: Commit or stash first
   git add .
   git commit -m "Your message"
   ```

3. **If there are conflicts after pull:**
   - Git will mark conflicts in files
   - Fix conflicts manually
   - Then: `git add .` → `git commit` → `git push`

---

## Option 2: Branch Workflow (Recommended)

This is the safer, professional way to work.

### Step-by-Step: Working on `niaz` Branch

#### 1. Start Working on a Feature

```bash
# Make sure you're on main and it's up to date
git checkout main
git pull origin main

# Create and switch to niaz branch
git checkout -b niaz

# OR if niaz branch already exists:
git checkout niaz
git pull origin niaz  # Get latest from remote
```

#### 2. Make Your Changes

```bash
# Make your code changes
# (edit files normally)

# Check what changed
git status

# Add changes
git add .

# Commit
git commit -m "Add feature: Success Stories admin panel"
```

#### 3. Push to `niaz` Branch

```bash
# Push to remote niaz branch
git push origin niaz
```

#### 4. Create Pull Request on GitHub

1. Go to: `https://github.com/farheentrisha/FineAnswer`
2. You'll see a banner: **"niaz had recent pushes"** with a button **"Compare & pull request"**
3. Click **"Compare & pull request"**
4. Fill in:
   - **Title:** Brief description (e.g., "Add Success Stories feature")
   - **Description:** What you changed and why
5. Click **"Create pull request"**

#### 5. Review and Merge

- Review your changes in the PR
- If everything looks good, click **"Merge pull request"**
- Click **"Confirm merge"**
- Your code is now in `main`!

#### 6. Update Your Local Main

After merging on GitHub:

```bash
# Switch back to main
git checkout main

# Pull the merged changes
git pull origin main

# Now your local main is up to date!
```

---

## When to Use `git pull`

### ✅ Always Pull Before Starting Work

```bash
# Before making changes, pull latest code
git checkout main
git pull origin main
```

**Why?** Someone else might have pushed changes you need.

### ✅ Always Pull Before Pushing

```bash
# Before pushing, pull to avoid conflicts
git pull origin main
git push origin main
```

**Why?** Prevents "rejected (non-fast-forward)" errors.

### ✅ After Merging a Pull Request

```bash
# After your PR is merged on GitHub
git checkout main
git pull origin main
```

**Why?** Your local main needs the merged code.

### ✅ When Switching Branches

```bash
# When switching to a branch, pull latest
git checkout niaz
git pull origin niaz
```

**Why?** Remote branch might have updates.

### ❌ Don't Pull If...

- You have uncommitted changes (commit or stash first)
- You're in the middle of resolving conflicts
- You're about to create a new branch (pull on main first, then create branch)

---

## Common Scenarios & Solutions

### Scenario 1: "I want to push to main directly"

```bash
# Step 1: Make sure you're on main
git checkout main

# Step 2: Pull latest (CRITICAL!)
git pull origin main

# Step 3: Make your changes
# (edit files)

# Step 4: Add, commit, push
git add .
git commit -m "Your commit message"
git push origin main
```

### Scenario 2: "I want to work on niaz branch and create PR"

```bash
# Step 1: Update main first
git checkout main
git pull origin main

# Step 2: Switch to niaz (or create it)
git checkout niaz
# If branch doesn't exist: git checkout -b niaz

# Step 3: Make your changes
# (edit files)

# Step 4: Commit
git add .
git commit -m "Your commit message"

# Step 5: Push to niaz
git push origin niaz

# Step 6: Go to GitHub and create PR
# (use the web interface)
```

### Scenario 3: "I got 'rejected (non-fast-forward)' error"

```bash
# This means remote has changes you don't have
# Solution: Pull first, then push

git pull origin main
# If conflicts occur, fix them, then:
git add .
git commit -m "Merge remote changes"
git push origin main
```

### Scenario 4: "I have uncommitted changes but need to pull"

```bash
# Option A: Commit your changes first
git add .
git commit -m "WIP: work in progress"
git pull origin main

# Option B: Stash your changes temporarily
git stash
git pull origin main
git stash pop  # Restore your changes
```

### Scenario 5: "My PR is merged, what now?"

```bash
# Step 1: Switch to main
git checkout main

# Step 2: Pull the merged code
git pull origin main

# Step 3: (Optional) Delete local niaz branch if done
git branch -d niaz

# Step 4: (Optional) Delete remote niaz branch
git push origin --delete niaz
```

---

## Best Practices

### ✅ DO:

1. **Always pull before starting work**
   ```bash
   git pull origin main
   ```

2. **Write clear commit messages**
   ```bash
   git commit -m "Add feature: Success Stories with Cloudinary upload"
   # NOT: git commit -m "fix" or "update"
   ```

3. **Commit often** (small, logical commits)
   ```bash
   # Good: Multiple small commits
   git commit -m "Add SuccessStoryForm component"
   git commit -m "Add API service for success stories"
   git commit -m "Update admin page to display stories"
   ```

4. **Test before pushing**
   - Make sure your code works
   - Check for errors
   - Then push

5. **Use branches for features**
   - One feature = one branch
   - Makes it easier to review and revert if needed

### ❌ DON'T:

1. **Don't push without pulling first**
   - Always: `git pull` → make changes → `git push`

2. **Don't commit everything in one huge commit**
   - Break it into logical pieces

3. **Don't force push to main**
   ```bash
   # NEVER do this on main:
   git push --force origin main
   ```

4. **Don't work directly on main for big features**
   - Use a branch instead

5. **Don't ignore merge conflicts**
   - Always resolve them properly

---

## Quick Reference Cheat Sheet

### Daily Workflow (Direct to Main)

```bash
git checkout main
git pull origin main
# Make changes
git add .
git commit -m "Description"
git push origin main
```

### Feature Workflow (Branch + PR)

```bash
git checkout main
git pull origin main
git checkout -b niaz
# Make changes
git add .
git commit -m "Description"
git push origin niaz
# Create PR on GitHub
# After merge: git checkout main && git pull origin main
```

### Emergency: Fix Conflicts

```bash
git pull origin main
# Fix conflicts in files
git add .
git commit -m "Resolve merge conflicts"
git push origin main
```

---

## Summary

### When to Push Directly to Main:
- ✅ Small fixes
- ✅ Quick updates
- ✅ You're the only developer
- ✅ Always pull first!

### When to Use Branch + PR:
- ✅ New features
- ✅ Major changes
- ✅ Team collaboration
- ✅ Want code review

### When to Pull:
- ✅ Before starting work
- ✅ Before pushing
- ✅ After switching branches
- ✅ After PR is merged

---

## Need Help?

If you get stuck:

1. **Check status:**
   ```bash
   git status
   ```

2. **See what changed:**
   ```bash
   git diff
   ```

3. **See commit history:**
   ```bash
   git log --oneline -10
   ```

4. **Abort if needed:**
   ```bash
   git merge --abort  # Cancel merge
   git rebase --abort  # Cancel rebase
   ```

---

**Remember:** When in doubt, `git status` is your friend! It tells you exactly what's happening.

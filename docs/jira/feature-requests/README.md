# Feature Requests

This directory contains detailed documentation for all feature requests and enhancement proposals for the Screengraph project.

## Purpose

- **Detailed Planning**: Document requirements and technical design
- **Collaboration**: Share proposals and gather feedback
- **Tracking**: Monitor feature development progress
- **Knowledge Base**: Archive feature history and decisions

## When to Create a Feature Request

Create a new feature request file when:
- Proposing new functionality
- Planning significant enhancements
- Changing architecture
- Introducing new integrations
- Process improvements requiring implementation

## How to Create a Feature Request

1. **Copy Template**: Duplicate `0000-template.md`
2. **Number Sequentially**: Name it `NNNN-descriptive-name.md` (e.g., `0001-streaming-ui.md`)
3. **Fill Sections**: Complete all relevant sections
4. **Link to GitHub**: Create/link corresponding GitHub issue
5. **Update Status**: Keep status current through development lifecycle

## Naming Convention

```
NNNN-descriptive-kebab-case-name.md
```

Examples:
- `0001-agent-streaming-ui-implementation.md`
- `0002-multi-tenant-workspace-support.md`
- `0003-real-time-collaboration-feature.md`

## Status Values

- **Proposed**: Initial proposal, awaiting review
- **Approved**: Greenlit for development
- **In Development**: Actively being implemented
- **Completed**: Shipped to production
- **Rejected**: Not moving forward (document why)

## Priority Levels

- **Critical**: Blocker, must have immediately
- **High**: Important, schedule soon
- **Medium**: Nice to have, plan for future sprint
- **Low**: Backlog item, consider later

## Effort Estimates

- **Small**: < 1 day of work
- **Medium**: 1-3 days of work
- **Large**: > 3 days of work

## Integration with GitHub Issues

Each feature request should reference its corresponding GitHub issue:
- Create GitHub issue using `.github/ISSUE_TEMPLATE/feature_request.md`
- Tag with `enhancement` label
- Reference issue number in feature request file
- Link feature request file in GitHub issue description

## File Structure

See `0000-template.md` for the complete structure. Key sections:

- **Problem Statement**: What problem are we solving?
- **User Story**: Who benefits and how?
- **Technical Design**: How will we build it?
- **Acceptance Criteria**: How do we know it's done?
- **Testing Strategy**: How will we verify it works?

## From Proposal to Implementation

### 1. Proposal Phase
- Create feature request file with status: Proposed
- Fill out problem statement, user story, proposed solution
- Create GitHub issue for discussion
- Share with team for feedback

### 2. Approval Phase
- Review feedback and refine proposal
- Address open questions
- Get stakeholder approval
- Update status to: Approved

### 3. Development Phase
- Complete technical design section
- Break into implementation tasks
- Update status to: In Development
- Link PRs as work progresses

### 4. Completion Phase
- Verify acceptance criteria met
- Complete testing checklist
- Deploy to production
- Update status to: Completed
- Document success metrics

## Quick Start

```bash
# 1. Find next number
ls -1 docs/jira/feature-requests/ | grep -E '^[0-9]{4}' | tail -1
# If last is 0042-something.md, next is 0043

# 2. Create new file
cp docs/jira/feature-requests/0000-template.md docs/jira/feature-requests/0043-your-feature-name.md

# 3. Edit and fill in details
# 4. Link to GitHub issue #XX
# 5. Update status through lifecycle
```

## Tips for Good Feature Requests

✅ **Do:**
- Focus on the problem, not just the solution
- Include user stories and real use cases
- Consider edge cases and error scenarios
- Define clear acceptance criteria
- Think about testing strategy upfront

❌ **Don't:**
- Jump to implementation without defining the problem
- Skip user stories or acceptance criteria
- Ignore technical constraints or dependencies
- Forget about accessibility and performance
- Leave questions unresolved

---

See `/docs/claude.md` for overall documentation structure.


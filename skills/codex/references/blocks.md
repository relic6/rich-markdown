# Rich Markdown Blocks

Use only these v0.1 core blocks unless the user explicitly asks for experimental syntax.

## chart

Data chart. Use for compact numeric comparisons.

```rmd
:::chart bar title="P99 latency"
TokenBucket 23
LeakyBucket 19
SlidingWindow 41
:::
```

Types: `bar`, `line`, `pie`.

## grid

Multi-column comparison. Separate cells with `---`.

```rmd
:::grid 3
### Option A
Fast, simple.
---
### Option B
Flexible, heavier.
---
### Option C
Safe, slower.
:::
```

## callout

Emphasized note or decision.

```rmd
:::callout tip title="Recommendation"
Pick token bucket for burst-friendly traffic.
:::
```

Kinds: `info`, `tip`, `warning`, `danger`, `success`.

## slider

Reader-adjustable number. Pair with `export`.

```rmd
:::slider name=capacity min=10 max=1000 step=10 default=200 unit=req
:::
```

Variable names must match `[a-zA-Z_][a-zA-Z0-9_]*`.

## export

Copy/export template. References slider values with `{{name}}`.

```rmd
:::export label="Copy config"
rate_limiter:
  capacity: {{capacity | int}}
:::
```

## flow

Simple directed flow.

```rmd
:::flow direction=lr
Design -> Review -> Canary -> Full rollout
Canary -> Incident -> Rollback
:::
```

Directions: `lr`, `tb`.

## diff

Code or config difference.

```rmd
:::diff lang=python title="Limiter change"
- @rate_limit(window=60, max=100)
+ @token_bucket(capacity=200, refill=50) @注: adds burst protection
:::
```

## tabs

Multiple views in one area.

```rmd
:::tabs default=Summary
@Summary
Plain-language explanation.
@Details
Implementation details.
:::
```

## Choosing Blocks

- Comparison: `grid` + `chart` + `callout`
- PR explanation: `diff` + `tabs` + `callout`
- Parameter prototype: `slider` + `export`
- Release/workflow: `flow` + `callout`
- Research brief: `chart` + `grid`

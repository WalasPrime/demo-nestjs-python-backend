# ADR 01: CPU Scaling considerations

Problem: Normally, a Node.js process does not utilize all the CPU cores available. It could be beneficial to hardcode this support.

Available options: Utilize CPU cores by forking the process via the [cluster](https://nodejs.org/docs/latest/api/cluster.html) module; or not.

Decision: Don't implement CPU scaling.

Reasoning: In cloud environments it is often more cost-efficient to utilize smaller instances scaled horizontally based on demand. Hardcoding this support is not necessary.
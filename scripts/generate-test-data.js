// Generate a large JSONL file for performance testing
const fs = require("fs");
const path = require("path");

const statuses = ["active", "inactive", "pending", "archived"];
const departments = ["Engineering", "Sales", "Marketing", "HR", "Finance", "Support"];

function generateRow(id) {
  return JSON.stringify({
    id,
    name: `User ${id}`,
    email: `user${id}@example.com`,
    age: 20 + (id % 50),
    status: statuses[id % statuses.length],
    department: departments[id % departments.length],
    salary: 30000 + (id % 70) * 1000,
    joinedAt: new Date(2020, id % 12, (id % 28) + 1).toISOString(),
    active: id % 3 !== 0,
  });
}

const count = parseInt(process.argv[2]) || 10000;
const outputDir = path.join(__dirname, "..", "test-data");
const outputPath = path.join(outputDir, `test-${count}.jsonl`);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const stream = fs.createWriteStream(outputPath);

for (let i = 1; i <= count; i++) {
  stream.write(generateRow(i) + "\n");
}

stream.end();

console.log(`Generated ${count} rows to ${outputPath}`);

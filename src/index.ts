import '@k2oss/k2-broker-core';

metadata = {
    systemName: "stringutilities.javascriptbroker.k2nexus",
    displayName: "String Utilities Javascript Broker",
    description: "A JSSP based string utilities for K2 Nexus."
};

ondescribe = async function ({ configuration }): Promise<void> {
    postSchema({
        objects: {
            "Similarity": {
                displayName: "Similarity",
                description: "Determine the similarity of 2 strings using different algorithms.",
                properties: {
                    "FirstString": {
                        displayName: "String A",
                        type: "string"
                    },
                    "SecondString": {
                        displayName: "String B",
                        type: "string"
                    },
                    "Similarity": {
                        displayName: "Similarity",
                        type: "decimal"
                    }
                },
                methods: {
                    "LevenshteinAlgorithm": {
                        displayName: "Levenshtein Algorithm",
                        type: "read",
                        inputs: ["FirstString", "SecondString"],
                        requiredInputs: ["FirstString", "SecondString"],
                        outputs: ["Similarity"]
                    }
                }
            }
        }
    });
}

onexecute = async function ({ objectName, methodName, parameters, properties, configuration, schema }): Promise<void> {
    switch (objectName) {
        case "Similarity": await onExecuteSimilarity(methodName, properties, parameters); break;
        default: throw new Error("The object " + objectName + " is not supported.");
    }
}

async function onExecuteSimilarity(methodName: string, properties: SingleRecord, parameters: SingleRecord): Promise<void> {
    switch (methodName) {
        case "LevenshteinAlgorithm": await LevenshteinAlgorithm(properties); break;
        default: throw new Error("The method " + methodName + " is not supported.");
    }
}

// Source: https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely
// Link: https://stackoverflow.com/a/36566052
function LevenshteinAlgorithm(properties: SingleRecord): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        let s1: string = properties["FirstString"].toString();
        let s2: string = properties["SecondString"].toString();

        let longer = s1;
        let shorter = s2;

        if (s1.length < s2.length) {
            longer = s2;
            shorter = s1;
        }

        let longerLength: number = longer.length;
        if (longerLength == 0) {
            return 1.0;
        }

        let similarity: number = (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength.toString());

        postResult({
            "Similarity": similarity
        });
        resolve();
    });
}

// Source: https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely
// Link: https://stackoverflow.com/a/36566052
function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
        var lastValue = i;
        for (var j = 0; j <= s2.length; j++) {
            if (i == 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    var newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue),
                            costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0)
            costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}
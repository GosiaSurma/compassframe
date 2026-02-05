
// import fetch from "node-fetch";

async function testCreateSession() {
    console.log("Attempting to create session...");
    try {
        const res = await fetch("http://localhost:8080/api/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                role: "parent",
                shadowId: "shadow_phone_use"
            })
        });

        const text = await res.text();
        console.log(`Status: ${res.status}`);
        console.log(`Body: ${text}`);
    } catch (err) {
        console.error("Request failed:", err);
    }
}

testCreateSession();

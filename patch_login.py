import re

with open("src/components/Login.jsx", "r") as f:
    content = f.read()

replacement = """    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      if (data?.session?.user?.email === "james.ellars@axim.us.com") {
        console.log("EXECUTIVE ACCESS GRANTED: Routing Super Admin session for James Ellars.");
      }
    }
    setLoading(false);"""

content = re.sub(r"    const \{ error \} = await supabase.auth.signInWithPassword\(\{\n      email,\n      password,\n    \}\);\n\n    if \(error\) \{\n      setError\(error.message\);\n    \}\n    setLoading\(false\);", replacement, content)

with open("src/components/Login.jsx", "w") as f:
    f.write(content)

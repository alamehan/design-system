import json, os, re, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
COMP = os.path.join(ROOT, "components")
found = json.load(open(os.path.join(ROOT, "foundations.json")))
sem = found["semantic"]["light"]

def resolve(tok):
    parts = tok.split(".")
    if parts[0] in ("system", "neutral", "brand", "semantic"):
        cur = sem
    elif parts[0] == "spacing":
        cur = found.get("spacing", {}); parts = parts[1:]
    elif parts[0] == "stroke":
        cur = found.get("stroke", {}); parts = parts[1:]
    elif parts[0] == "corner-radius":
        cur = found.get("corner-radius", {}); parts = parts[1:]
    elif parts[0] == "text-styles":
        cur = found.get("text-styles", {}); parts = parts[1:]
    else:
        return False
    for p in parts:
        if isinstance(cur, dict) and p in cur:
            cur = cur[p]
        else:
            return False
    return True

TOK = re.compile(r'(?<![a-zA-Z0-9-])(?:system|neutral|brand|semantic|spacing|stroke|corner-radius|text-styles)(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)+')

catalog = {}
for f in sorted(os.listdir(COMP)):
    if f.endswith(".json") and not f.startswith("page-"):
        try:
            d = json.load(open(os.path.join(COMP, f)))
        except Exception as e:
            print("PARSE FAIL (component):", f, e); sys.exit(1)
        cid = d.get("id")
        if cid:
            catalog[cid] = d

errs, warns = [], []
bad_tokens = set()
tok_count = 0

def walk(node, fname):
    global tok_count
    if isinstance(node, dict):
        comp = node.get("component")
        if isinstance(comp, str):
            if comp not in catalog:
                errs.append(f"{fname}: unknown component id '{comp}'")
            else:
                spec_props = catalog[comp].get("props") or {}
                for k, v in (node.get("props") or {}).items():
                    sp = spec_props.get(k)
                    if isinstance(sp, dict) and isinstance(sp.get("values"), list) and isinstance(v, str):
                        if v not in sp["values"]:
                            errs.append(f"{fname}: {comp}.{k}='{v}' not in allowed values {sp['values']}")
        vc = node.get("valueComponent")
        if isinstance(vc, str) and vc not in catalog:
            errs.append(f"{fname}: unknown valueComponent id '{vc}'")
        for v in node.values():
            walk(v, fname)
    elif isinstance(node, list):
        for v in node:
            walk(v, fname)
    elif isinstance(node, str):
        for m in TOK.findall(node):
            tok_count += 1
            if not resolve(m):
                bad_tokens.add(f"{fname}: {m}")

pages = sorted(f for f in os.listdir(COMP) if f.startswith("page-") and f.endswith(".json"))
print("page specs found:", len(pages))
for f in pages:
    try:
        d = json.load(open(os.path.join(COMP, f)))
    except Exception as e:
        print("PARSE FAIL:", f, e); sys.exit(1)
    for key in ("_schema", "id", "name", "canvas", "pageType", "description", "layout", "zones", "customElementsRegistry", "code"):
        if key not in d:
            errs.append(f"{f}: missing top-level key '{key}'")
    if d.get("_schema") != "elabram-page-sample-v1":
        errs.append(f"{f}: wrong _schema")
    if f[:7] != "page-0" or True:
        pass
    if "geometry" not in d:
        errs.append(f"{f}: missing 'geometry' (measured dimensions from design)")
    if d.get("figmaNodeId") is None and "source" not in d:
        errs.append(f"{f}: figmaNodeId null but no 'source' provenance")
    walk(d, f)
    print("  OK parse:", f, "| id:", d.get("id"), "| code:", d.get("code"))

print()
print("catalog component ids:", len(catalog))
print("token references checked:", tok_count)
if bad_tokens:
    print("UNRESOLVED TOKENS:")
    for t in sorted(bad_tokens):
        print("  -", t)
if errs:
    print("ERRORS:")
    for e in errs:
        print("  -", e)
if not errs and not bad_tokens:
    print("ALL PAGE SPECS VALID: parse OK, all tokens resolve, all component ids + enum props valid, geometry present on every page")
else:
    sys.exit(1)

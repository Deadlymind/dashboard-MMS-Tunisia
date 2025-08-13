# Run:  BASE="http://127.0.0.1:8000/api/v1/exploitation" python backend/scripts/smoke_clients.py
import os, json, urllib.request, urllib.error
B=os.environ.get("BASE","http://127.0.0.1:8000/api/v1/exploitation")
def http(m,u,d=None):
    H={"Content-Type":"application/json"}; b=json.dumps(d).encode() if d is not None else None
    r=urllib.request.Request(B+u,data=b,headers=H,method=m)
    try:
        with urllib.request.urlopen(r) as s:
            t=s.read().decode(); return s.status, json.loads(t)
    except urllib.error.HTTPError as e:
        t=e.read().decode(); 
        try: return e.code, json.loads(t)
        except: return e.code, t
def ok(name,cond): print(("✅" if cond else "❌"), name)

s,j=http("GET","/clients/choices/"); ok("choices 200", s==200)
ok("PP/PM/AS", {x[0] for x in j["person_types"]}=={"PP","PM","AS"})
ok("3 statuts", [x[0] for x in j["statuts"]]==["NOUVELLE CREATION","EXISTANTE NON EXERCANTE","EXERCANTE"])
ok("formes", {"SUARL","SURAL","SARL","SA","PP","ASSOCIATION"}.issubset({x[0] for x in j["formes_juridiques"]}))
ok("has TN", any(c["code"]=="TN" for c in j["countries"]))

s1,j1=http("POST","/clients/",{"raison_sociale":"Map EXNEX NBSP","type_personne":"PM","statut":"\u00A0EXNEX\u00A0","forme_juridique":"SUARL"})
ok("EXNEX maps", s1==201 and j1["statut"]=="EXISTANTE NON EXERCANTE")
s2,j2=http("POST","/clients/",{"raison_sociale":"Map NE","type_personne":"PM","statut":"NE","forme_juridique":"SUARL"})
ok("NE maps", s2==201 and j2["statut"]=="NOUVELLE CREATION")
s3,j3=http("POST","/clients/",{"raison_sociale":"Bad","type_personne":"PM","statut":"INVALID"})
ok("invalid statut -> 400", s3==400)

sC,jC=http("GET","/clients/")
cid = jC[0]["id"] if isinstance(jC,list) and jC else None
if not cid:
    sN,jN=http("POST","/clients/",{"raison_sociale":"Smoke Client","type_personne":"PM","statut":"EX","forme_juridique":"SUARL"})
    cid=jN["id"]
s4,j4=http("POST",f"/clients/{cid}/objet-social/",{"nomination":"Activités informatiques","agrement":True})
s5,j5=http("POST",f"/clients/{cid}/objet-social/",{"nomination":"Services Agricoles","agrement":False})
s6,j6=http("GET",f"/clients/{cid}/objet-social/")
ok("OS True", s4==201); ok("OS False", s5==201)
ok("OS listed", s6==200 and isinstance(j6,list) and j4["id"] in [x["id"] for x in j6] and j5["id"] in [x["id"] for x in j6])

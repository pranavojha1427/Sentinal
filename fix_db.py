import json

with open('final_seed.py', 'r') as f:
    pass

def cap(val):
    if val > 999999.99: return 999999.99
    if val < -999999.99: return -999999.99
    return val

# I will just write a script that updates all projects in DB directly if they overflow, wait, the chunk failed so 200 projects were NOT inserted!
# I need to insert them again.

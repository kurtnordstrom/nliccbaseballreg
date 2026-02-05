import requests

base_url = "http://127.0.0.1:8000"
username = "kurt"
password = "kurtpass"

def print_response(resp, desc=None):
    if not desc:
        print("%s %s" % (resp, resp.text))
    else:
        print("(%s) %s %s" % (desc, resp, resp.text))

def get_item_and_print_response(endpoint, id, desc, headers=None):
    endpoint = "%s/%s/%i/" % (base_url, endpoint, id)
    get_resp = requests.get(endpoint, headers=headers)
    print_response(get_resp, desc)

def get_list_and_print_response(endpoint, desc, headers=None, query=None):
    endpoint = "%s/%s/" % (base_url, endpoint)
    get_resp = requests.get(endpoint, headers=headers, params=query)
    print_response(get_resp, desc)


if __name__ == "__main__":

    droneone_json = { 
        "username" : "drone1",
        "password" : "drone1",
        "person" : {
            "first_name" : "Drone",
            "last_name" : "One",
            "email" : "drone@one.com",
            "date_of_birth" : "2001-01-01",
            "address" : "1111",    
            "is_user" : True,
            },
        "family" : {
            "family_name" : "DroneOne",
            "registration_submitted" : False,
        }
    }

    droneone_response = requests.post("%s/api/user/register/" % base_url, json=droneone_json)

    print_response(droneone_response, "Drone One")


    dronetwo_json = { 
        "username" : "drone2",
        "password" : "drone2",
        "person" : {
            "first_name" : "Drone",
            "last_name" : "Two",
            "email" : "drone@two.com",
            "date_of_birth" : "2002-02-02",
            "address" : "2222",    
            "is_user" : True,
            },
        "family" : {
            "family_name" : "DroneTwo",
            "registration_submitted" : False,
        }
    }

    dronetwo_response = requests.post("%s/api/user/register/" % base_url, json=dronetwo_json)

    print_response(dronetwo_response, "Drone Two")


    #Attempt to register user
    register_json = { 
        "username" : username,
        "password" : password,
        "person" : {
            "first_name" : "Kurt",
            "last_name" : "Nordstrom",
            "email" : "kurt.e.nordstrom@gmail.com",
            "date_of_birth" : "1977-09-30",
            "address" : "Somewheresville",    
            "is_user" : True,
            },
        "family" : {
            "family_name" : "Nordstrom",
            "registration_submitted" : False,
        }
    }

    register_response = requests.post("%s/api/user/register/" % base_url, json=register_json)

    print("%s %s" % (register_response, register_response.text))

    #Attempt to use registered user to get a token
    token_response = requests.post("%s/api/token/" % base_url, json=register_json)

    print("%s %s" % (token_response, token_response.text))

    token = token_response.json()["access"]

    request_headers = {
        'Authorization' : f'Bearer {token}',
        'Content-Type' : 'application/json'
    }

    #Attempt to see if we have an existing person

    person_query_response = requests.get("%s/api/person/" % base_url, headers=request_headers)

    print_response(person_query_response)

    person_id = person_query_response.json()[0]["id"]

    family_id = person_query_response.json()[0]["family"]

    self_role_json = {
        "name" : "Head Coach",
        "person" : person_id,
        "season" : "2026"
    }
    #Add a role to them

    self_role_response = requests.post("%s/api/role/" % base_url, json=self_role_json, headers=request_headers)

    print_response(self_role_response)

    #Add non-player person
    np_person_json = {
        "first_name" : "Amanda",
        "last_name" : "Nordstrom",
        "email" : "northstream@blar.net",
        "date_of_birth" : "1980-03-03",
        "address" : "Somewheresville",
        "family" : family_id
    }

    np_person_response = requests.post("%s/api/person/" % base_url, json=np_person_json, headers=request_headers)

    print_response(np_person_response)


    np_person_id = np_person_response.json()["id"]

    #Add a role to them

    np_role_json = {
        "name" : "Concessions",
        "person" : np_person_id,
        "season" : "2026"
    }

    np_role_response = requests.post("%s/api/role/" % base_url, json=np_role_json, headers=request_headers)

    print_response(np_role_response)

    get_list_and_print_response("api/role", "Get all roles", headers=request_headers)

    get_list_and_print_response("api/role", "Get person specific roles", headers=request_headers, query={"person": person_id})



    #Create a player person

    player_person_json = {
        "first_name" : "Jimothy",
        "last_name" : "Nordstrom",
        "date_of_birth" : "2013-05-05",
        "address" : "Somewheresville",
        "family" : family_id
    }

    player_person_response = requests.post("%s/api/person/" % base_url, json=player_person_json, headers=request_headers)

    print_response(player_person_response, "post player person person")

    player_person_id = player_person_response.json()["id"]

    player_player_json = {
        "person" : player_person_id,
        "shirt_size" : "Youth L",
        "franchise_first" : "Forest",
        "franchise_second" : "Navy",
        "season" : "2026",
        "returning" : True
    }

    player_player_response = requests.post("%s/api/player/" % base_url, json=player_player_json, headers=request_headers)

    print_response(player_player_response, "Post player person player")

    player_player_id = player_player_response.json()["id"]

    get_item_and_print_response("api/person", player_person_id, "Get player person", headers=request_headers)

    player_person_update_json = {
        "first_name" : "Jimothy",
        "last_name" : "Nordstrom",
        "date_of_birth" : "2013-05-05",
        "address" : "Nowheresville",
        "family" : family_id
    }

    player_person_put_response = requests.put("%s/api/person/%i/" % (base_url, player_person_id), json=player_person_update_json, headers=request_headers)

    print_response(player_person_put_response, "Player person put response")

    get_item_and_print_response("api/person", player_person_id, "Get player person", headers=request_headers)

    #player_person_delete_response = requests.delete("%s/api/person/%i/" % (base_url, player_person_id), headers=request_headers)

    #print_response(player_person_delete_response, "player person delete")

    #get_item_and_print_response("api/person", player_person_id, "Get player person", headers=request_headers)

    #get_item_and_print_response("api/player", player_player_id, "Get player player", headers=request_headers)

    #Add the player information to them

    #Submit the registration

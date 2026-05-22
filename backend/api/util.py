from .models import Person, Family, Role, Player

def set_franchise(person, franchise):
    franchise = franchise.upper()
    if franchise not in [ "FOREST", "BLUE", "NAVY", "MAROON"]:
        print("Invalid franchise %s" % franchise)
        return
    player = Player.objects.get(person=person)
    current_franchise = player.franchise_first
    if current_franchise == franchise:
        print("Already in franchise")
        return
    player.franchise_first = franchise
    if player.franchise_second == franchise:
        player.franchise_second = current_franchise
    player.save()


def get_volunteer_positions(family):
    persons = Person.objects.filter(family=family)
    volunteer_list = []
    for person in persons:
        roles = Role.objects.filter(person=person)
        for role in roles:
            if not role.name in volunteer_list:
                volunteer_list.append(role.name)

    return volunteer_list

def add_role(person, role):
    role_list = [ "HEAD_COACH", "ASSISTANT_COACH", "SCOREKEEPER", "UMPIRE", "CONCESSIONS", "LOST_AND_FOUND", "SNACK COORDINATOR", "SCOREBOARD_OPERATOR", "PROPERTY_ASSISTANT", "FIELD_ASSISTANT" ]
    upper_role = role.upper()
    if upper_role not in role_list:
        print("%s is not a valid role" % role)
        return
    existing_role = Role.objects.filter(person=person, name=upper_role).exists()
    if existing_role:
        print("Role is already assigned")
        return
    Role.objects.create(person=person, name=upper_role, season='2026')

    

def get_family_franchises(family):
    family_people = Person.objects.filter(family=family)
    family_players = []
    for person in family_people:
        try:
            player = Player.objects.get(person=person)
            family_players.append(player)
        except:
            pass
    if not len(family_players):
        return []
    #order players by birthdate
    family_players.sort(key=lambda x:x.person.date_of_birth)
    family_franchises = []
    for player in family_players:
        franchise = player.franchise_first
        if franchise not in family_franchises:
            family_franchises.append(franchise)
    return family_franchises

def get_franchise(person):
    franchises = get_family_franchises(person.family)
    if not len(franchises):
        return None
    return franchises[0]

def get_contact_info(person):
    primary = get_primary_parent(person)
    email = person.email
    phone = person.phone_primary
    address = person.address
    if not address:
        address = primary.address
    if not phone:
        phone = primary.phone_primary
    if not email:
        email = primary.email
    return {
        'phone' : phone,
        'email' : email,
        'address' : address
    }

def get_primary_parent_from_family(family):
    primary = None
    try:
        primary = Person.objects.get(family=family, is_user=True)
    except:
        print("No primary for family %s" % family)
    return primary

def get_primary_parent(person):
    family = person.family
    return get_primary_parent_from_family(family)
    

def get_family_people_categories(family):
    persons = Person.objects.filter(family=family)
    family_dict = {
        "parents": [],
        "players": [],
        "other": []
    }
    for person in persons:
        if person.is_parent:
            family_dict["parents"].append(person)
        elif Player.objects.filter(person=person).exists():
            family_dict["players"].append(person)
        else:
            family_dict["other"].append(person)
    
    return family_dict


def change_shirt_size(shirt_size, last_name, first_name, franchise=None):
    valid_sizes = [
        "Youth XS",
        "Youth Small",
        "Youth Medium",
        "Youth Large",
        "Youth XL",
        "Adult Small",
        "Adult Medium",
        "Adult Large",
        "Adult XL",
        "Adult 2XL",
        "Adult 3XL"
    ]
    if shirt_size not in valid_sizes:
        raise Exception("Size %s is not valid" % shirt_size)
    
    person = None
    try:
        people = Person.objects.filter(last_name=last_name, first_name=first_name)
        if franchise:
            franchise = franchise.upper()
            for person_candidate in people:
                player = Player.objects.get(person=person_candidate)
                if player.franchise_first == franchise:
                    person = person_candidate
                    break
            if person == None:
                raise Exception("No person matching criteria and franchise") 
        else:
            person = people[0]   
    except Exception as e:
        raise Exception("Unable to find person %s" % e)
    
    player = Player.objects.get(person=person)
    player.shirt_size = shirt_size
    player.save()
    
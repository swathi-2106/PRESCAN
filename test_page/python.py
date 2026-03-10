import hashlib
correct_username = "Swathi"
correct_hash = "2ce32db3417302148891505df828a51d"

username = input("Enter username: ")
password = input("Enter password: ")

entered_hash = hashlib.md5(password.encode()).hexdigest()

if username == correct_username and entered_hash == correct_hash:
    print("\033[92mLogin Successful\033[0m")
else:
    print("\033[91mLogin Unsuccessful\033[0m")



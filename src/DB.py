import mysql.connector
from mysql.connector import Error

connection = None

try:
    connection = mysql.connector.connect(
        host='localhost',
        database='test',
        user='root',
        password='Amod@0511'
    )

    if connection.is_connected():
        dbInformation = connection.get_server_info()
        print("Connected to MySQL Server version ", dbInformation)
        cursor = connection.cursor()
        # Query for inserting data
        sqlQuery = """INSERT INTO cbtest 
                        (message, billType, consumerID) 
                        VALUES (%s, %s, %s)"""

        # Data
        dataInserted = ("Welcome to the M1/K1 bill payment bot. Which bill do you want to pay", "water bill", "0000000011")

        # Executing SQL query
        cursor.execute(sqlQuery, dataInserted)

        # Committing changes
        connection.commit()
        print("Record inserted successfully")

except Error as e:
    print("Error while connecting to MySQL", e)
finally:
    if connection is not None and connection.is_connected():
        cursor.close()
        connection.close()
        print("MySQL connection is closed")

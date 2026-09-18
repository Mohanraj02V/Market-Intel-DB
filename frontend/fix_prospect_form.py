import os

with open('src/components/prospects/ProspectForm.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add marketEventsList
if "const { items: marketEventsList }" not in content:
    content = content.replace(
        "const [targetOptions, setTargetOptions] = useState([]);",
        "const [targetOptions, setTargetOptions] = useState([]);\n  const { items: marketEventsList } = useSelector((state) => state.marketEvents);"
    )

with open('src/components/prospects/ProspectForm.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed ProspectForm.jsx ReferenceError")

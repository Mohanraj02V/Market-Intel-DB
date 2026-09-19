import re

filepath = 'frontend/src/pages/LqPipelinePage.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = """                    </div>
                  </div>
                </div>
              </div>
            </div></div>

              </div>
            </div>"""

replacement = """                    </div>
                  </div>
                </div>
              </div>
            </div>"""

content = content.replace(target, replacement)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

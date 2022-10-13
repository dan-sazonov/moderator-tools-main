/**
 * @name ModeratorTools
 * @version 0.9.20
 * @author Pavel_Boyazov
 * @authorId 328529082159464448
 * @authorLink https://vk.com/Pavel_Boyazov
 * @source https://github.com/Pavel-Boyazov/moderator-tools
 * @donate https://www.donationalerts.com/r/pavel_boyazov
 * @invite eXtcpFCKJj
 */

var commands;
var headers = [];
var rules = [];
var opened = false;
var saved_id = "";
var dev = false;

let socket;

class ModeratorTools {

    getName() {
        return "ModeratorTools";
    }

    getVersion() {
        return "0.9.11";
    }

    getAuthor() {
        return "Pavel_Boyazov";
    }

    getDescription() {
        return 'Плагин, призванный помочь модерации дискорда. О багах сообщать сюда: https://vk.com/pavel_boyazov или "Булочка | pasha_boez#9831". Статус: Открытая Бета';
    }

    setData(key, value) {
        BdApi.setData(this.getName(), key, value);
    }

    getData(key) {
        return BdApi.getData(this.getName(), key);
    }

    showChangeLog() {
        return ZLibrary.Modals.showChangelogModal("Новое обновление ModeratorTools!", this.getVersion(), [
            {
                title: "Добавлено",
                type: "improved",
                items: [
                    "Случайно скопировали ID сообщения? Дописали в конце пару цифр? Плагин сообщит вам об этом!",
                    "Выдавали наказание и забыли правила? Надо кому-то сказать по какому правилу на него снизошла небесная кара? Специально для данных и подобных случаев, была добавлена вкладка с правилами с удобным поиском! Дискорду есть чему у нас поучиться",
                ]
            },
            {
                title: "Малые изменения",
                type: "fixed",
                items: [
                    "Переписаны классы элементов",
                    "Добавлена своя таблица стилей. Красота...",
                ]
            },
        ])
    }

    async load() {

        // Добавление стилей
        if (document.querySelector("#MToolsCSS")) document.querySelector("#MToolsCSS").remove()
        let style = document.createElement("style")
        style.id = "MToolsCSS"
        style.innerHTML = ".mtools-button {\r\n    flex-grow: 1;\r\n    margin: 3px;\r\n    min-width: 24%;\r\n}\r\n\r\n.mtools-dashboard {\r\n    flex-wrap: wrap;\r\n    padding: 0px 16px 10px 13px;\r\n}\r\n\r\n.section-rule{\r\n    font-size: 110%;\r\n    border-radius: 3px;\r\n    outline: 3px none #00FF00;\r\n    padding: 3px;\r\n    margin: 3px;\r\n    user-select: none;\r\n    cursor: pointer;}"
        document.head.append(style);

        // Проверка присутствия библиотеки
        if (!global.ZeresPluginLibrary) {
            BdApi.showConfirmationModal("Отсутствует библиотека",
                [
                    "У вас отсутствует библиотека ZeresPluginLibrary без которой невозможно использование данного плагина.",
                    'Нажмите кнопку "Загрузить" чтобы загрузить библиотеку.'
                ],
                {
                    confirmText: "Загрузить",
                    cancelText: "Отмена",
                    onCancel: _ => {
                        new ModeratorTools().stop()
                        return BdApi.Plugins.disable('ModeratorTools')
                    },
                    onConfirm: _ => {
                        function manualLoad() {
                            BdApi.alert("Отсутствует библиотека", BdApi.React.createElement("span", {
                                style: {
                                    color: "white"
                                }
                            }, `Что-то пошло не так! Вам придётся загрузить библиотеку вручную. Ошибку можно увидеть в консоли.`, BdApi.React.createElement("div", {}, BdApi.React.createElement("a", {
                                href: "https://betterdiscord.net/ghdl?id=2252",
                                target: "_blank"
                            }, "Нажмите сюда для загрузки ZeresPluginLibrary"))));
                        }

                        const fs = require("fs"),
                            path = require("path")
                        let ZLraw = pasteMessage.requestData("https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js")
                        try {
                            fs.writeFile(path.join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), ZLraw, (err) => {
                                if (err) {
                                    console.error(err)
                                    BdApi.showToast("Произошла ошибка при записи файла. Сообщите мне vk.com/Pavel_Boyazov");
                                    new ModeratorTools().stop()
                                    return BdApi.Plugins.disable('ModeratorTools')
                                }
                                setTimeout(() => {
                                    BdApi.Plugins.reload(this.getName())
                                    BdApi.Plugins.enable('ModeratorTools')
                                }, 1000)
                            })
                        } catch (err) {
                            console.error("Критическая ошибка при загрузке ZeresPluginLibrary", err), manualLoad()
                            new ModeratorTools().stop()
                            return BdApi.Plugins.disable('ModeratorTools')
                        }
                    }
                })
        } else if (ZLibrary.PluginUpdater.defaultComparator(BdApi.getData("ZeresPluginLibrary", "currentVersionInfo").version, "2.0.0")) {
            BdApi.showConfirmationModal("Требуется обновить библиотеку",
                [
                    "У вас устарела библиотека ZeresPluginLibrary без которой невозможно использование данного плагина.",
                    'Нажмите кнопку "Обновить" чтобы обновить библиотеку.'
                ],
                {
                    confirmText: "Обновить",
                    cancelText: "Отмена",
                    onCancel: _ => {
                        new ModeratorTools().stop()
                        return BdApi.Plugins.disable('ModeratorTools')
                    },
                    onConfirm: _ => {
                        function manualLoad() {
                            BdApi.alert("Требуется обновить библиотеку", BdApi.React.createElement("span", {
                                style: {
                                    color: "white"
                                }
                            }, `Что-то пошло не так! Вам придётся загрузить библиотеку вручную. Ошибку можно увидеть в консоли.`, BdApi.React.createElement("div", {}, BdApi.React.createElement("a", {
                                href: "https://betterdiscord.net/ghdl?id=2252",
                                target: "_blank"
                            }, "Нажмите сюда для загрузки ZeresPluginLibrary"))));
                        }

                        const fs = require("fs"),
                            path = require("path")
                        let ZLraw = pasteMessage.requestData("https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js")
                        try {
                            fs.writeFile(path.join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), ZLraw, (err) => {
                                if (err) {
                                    console.error(err)
                                    BdApi.showToast("Произошла ошибка при записи файла. Сообщите мне vk.com/Pavel_Boyazov");
                                    new ModeratorTools().stop()
                                    return BdApi.Plugins.disable('ModeratorTools')
                                }
                                setTimeout(() => {
                                    BdApi.Plugins.reload(this.getName())
                                    BdApi.Plugins.enable('ModeratorTools')
                                }, 1000)
                            })
                        } catch (err) {
                            console.error("Критическая ошибка при загрузке ZeresPluginLibrary", err), manualLoad()
                            new ModeratorTools().stop()
                            return BdApi.Plugins.disable('ModeratorTools')
                        }
                    }
                })
        }
        ;

        if (!this.getData("user") && global.ZeresPluginLibrary) {

            // Настройка плагина при установке
            let config = JSON.parse(pasteMessage.requestData("https://pavel-boyazov.github.io/settings_03.json"))
            if (ZLibrary.PluginUpdater.defaultComparator(this.getVersion(), config.requiredVersion)) return BdApi.showToast("Обновите плагин до актуальной версии!", {type: "error"})
            if (!this.getData("info")) this.setData("info", {
                version: this.getVersion(),
                cfgVersion: config.version,
                changeLog: false
            })
            if (!this.getData("buttons")) this.setData("buttons", config.buttons);
            if (!this.getData("folders")) this.setData("folders", config.folders);
            if (!this.getData("server")) this.setData("server", config.server);

            let cache = {}

            // Стартовое окно мастера настройки
            function beginModal() {
                BdApi.showConfirmationModal(`Мастер настройки ModeratorTools`,
                    [
                        "Благодарю вас за установку плагина ModeratorTools!",
                        BdApi.React.createElement("div", {style: {"min-height": "15px", "min-width": "15px"}}),
                        "Перед началом работы с плагином необходимо провести процедуру настройки состоящую из 3 этапов.",
                        BdApi.React.createElement("div", {style: {"min-height": "15px", "min-width": "15px"}}),
                        "Примечание: Если вы не желаете пройти процедуру настройки в настоящее время, вы сможете сделать это в любой момент через настройки плагинов следующим образом:",
                        BdApi.React.createElement("img", {
                            src: "https://i.imgur.com/jgC1MgH.png",
                            style: {"width": "416px"}
                        }),
                        BdApi.React.createElement("img", {
                            src: "https://i.imgur.com/zfaAEU5.png",
                            style: {"width": "416px"}
                        })
                    ],
                    {
                        confirmText: "Настроить",
                        cancelText: "Позже",
                        onCancel: _ => {
                            new ModeratorTools().stop()
                            return BdApi.Plugins.disable('ModeratorTools')
                        },
                        onConfirm: _ => {
                            return staffModal()
                        }
                    }
                )
            }

            // Окно настройки уровня модератора
            function staffModal() {
                BdApi.showConfirmationModal(`Настройка 1/3`,
                    [
                        "Что ж, приступим к настройке!",
                        "Для начала, определимся с вашей должностью.",
                        BdApi.React.createElement("div", {style: {"min-height": "15px", "min-width": "15px"}}),
                        "Введите уровень вашей должности:",
                        BdApi.React.createElement("input", {
                            className: "inputDefault-3FGxgL input-2g-os5",
                            type: "number",
                            placeholder: "0 - User, 1 - SP, 2 - ST, 3 - Куратор, 4 - DG, 5 - DM",
                            min: "0",
                            max: "5",
                            onKeyPress: (e) => {
                                if (e.charCode === 13) document.querySelector("button[type=submit]").click()
                            }
                        })
                    ],
                    {
                        confirmText: "Далее",
                        cancelText: "Отмена",
                        onCancel: _ => {
                            new ModeratorTools().stop()
                            return BdApi.Plugins.disable('ModeratorTools')
                        },
                        onConfirm: _ => {
                            if (!document.querySelector(".inputDefault-3FGxgL").value && !cache.staff) {
                                new ModeratorTools().stop()
                                BdApi.Plugins.disable('ModeratorTools')
                                return BdApi.showToast('Необходимо заполнить все поля!', {type: "error"})
                            }
                            cache.staff = document.querySelector(".inputDefault-3FGxgL").value || cache.staff
                            return cache.staff > 1 ? formModal() : prefixModal()
                        }
                    }
                )
            }

            // Окно настройки формы
            function formModal() {
                BdApi.showConfirmationModal(`Настройка 1.5/3`,
                    [
                        "Да вы я смотрю уже достигли должности СТ? Значит вы можете принимать формы.",
                        "Хотите ли вы использовать принятие форм через плагин?",
                    ],
                    {
                        confirmText: "Да",
                        cancelText: "Нет",
                        onCancel: _ => {
                            cache.forms = false
                            return prefixModal()
                        },
                        onConfirm: _ => {
                            cache.forms = true
                            return prefixModal()
                        }
                    }
                )
            }

            // Окно настройки префикса
            function prefixModal() {
                BdApi.showConfirmationModal(`Настройка 2/3`,
                    [
                        "Теперь надо определиться с вашим префиксом.",
                        "Префикс будет использоваться в формах которые вы шлёте, для последующей идентификации вас в случае оспаривания вашего решения.",
                        `Пример: /ban 328529082159464448 3d 4.1 ${cache.prefix || "Ваш префикс"}`,
                        BdApi.React.createElement("div", {style: {"min-height": "15px", "min-width": "15px"}}),
                        "Введите ваш префикс:",
                        GUI.newReactInput("Ваш префикс")
                    ],
                    {
                        confirmText: "Далее",
                        cancelText: "Назад",
                        onCancel: _ => {
                            return staffModal()
                        },
                        onConfirm: _ => {
                            if (!document.querySelector(".inputDefault-3FGxgL").value && !cache.prefix) {
                                new ModeratorTools().stop()
                                BdApi.Plugins.disable('ModeratorTools')
                                return BdApi.showToast('Необходимо заполнить все поля!', {type: "error"})
                            }
                            cache.prefix = document.querySelector(".inputDefault-3FGxgL").value.trim() || cache.prefix
                            return helpModal()
                        }
                    }
                )
            }

            // Окно настройки инструкции по получению роли
            function helpModal() {
                BdApi.showConfirmationModal(`Настройка 3/3`,
                    [
                        "После нашего с вами знакомства остаётся последний этап.",
                        "Здесь вы можете придумать свою инструкцию по получению роли организации, при помощи которой в будущем вы сможете помогать пользователям!",
                        "Если вы считаете что всё и так идеально, то можете сразу перейти к следующему этапу :)",
                        "Примечание: Можно использовать стандартные способы форматирование текста Discord",
                        BdApi.React.createElement("div", {style: {"min-height": "15px", "min-width": "15px"}}),
                        "Текущая инструкция:",
                        cache.roleHelp || new ModeratorTools().getData("buttons").role.content,
                        BdApi.React.createElement("div", {style: {"min-height": "15px", "min-width": "15px"}}),
                        "Введите свою инструкцию (опционально):",
                        BdApi.React.createElement("textarea", {
                            className: "input-2g-os5 scrollbarGhostHairline-2LpzZ9",
                            rows: 4
                        })
                    ],
                    {
                        confirmText: "Далее",
                        cancelText: "Назад",
                        onCancel: _ => {
                            return prefixModal()
                        },
                        onConfirm: _ => {
                            cache.roleHelp = document.querySelector(".input-2g-os5").value.trim() || new ModeratorTools().getData("buttons").role.content
                            return dev ? tokenModal() : endModal()
                        }
                    }
                )
            }

            // Окно настройки токена
            function tokenModal() {
                BdApi.showConfirmationModal(`Настройка бонус`,
                    [
                        "Вы попали на бонус уровень! Для получения доступа к предварительным версиям плагина введите в поле ниже токен от аккаунта GitHub.",
                        BdApi.React.createElement("div", {style: {"min-height": "15px", "min-width": "15px"}}),
                        "Инструкция по получению токена:",
                        "1. Подтвердите ваш Email (если не сделали этого ранее).",
                        "2. В правом верхнем углу нажмите на аватарку своего профиля, после чего нажмите \"Настройки\".",
                        BdApi.React.createElement("img", {
                            src: "https://i.imgur.com/XpjV3gm.png",
                            style: {"height": "400px"}
                        }),
                        "3. В панельке слева выберите \"Developer settings\".",
                        "4. В панельке слева выберите \"Personal access tokens\".",
                        "5. Нажмите кнопку \"Generate new token\".",
                        "6. Введите текст на ваше желание в поле ввода, выберите срок действия токена (примечание: По истечении срока потребуется сменить токен в настройках плагина), после чего поставьте галочки в строках \"repo\" и \"gist\".",
                        BdApi.React.createElement("img", {
                            src: "https://i.imgur.com/FbPYY7W.png",
                            style: {"width": "416px"}
                        }),
                        "7. Внизу страницы нажмите кнопку \"Generate token\" после чего скопируйте полученный токен.",
                        BdApi.React.createElement("img", {
                            src: "https://i.imgur.com/tf3HI2o.png",
                            style: {"width": "416px"}
                        }),
                        BdApi.React.createElement("div", {style: {"min-height": "15px", "min-width": "15px"}}),
                        "Введите свой токен:",
                        BdApi.React.createElement(
                            "input",
                            {
                                className: "inputDefault-3FGxgL input-2g-os5",
                                placeholder: "Ваш токен", type: "password",
                                onKeyPress: (e) => {
                                    if (e.charCode === 13) document.querySelector("button[type=submit]").click()
                                }
                            }
                        )
                    ],
                    {
                        confirmText: "Далее",
                        cancelText: "Назад",
                        onCancel: _ => {
                            return helpModal()
                        },
                        onConfirm: _ => {
                            if (!document.querySelector(".inputDefault-3FGxgL").value && !cache.token) {
                                new ModeratorTools().stop()
                                BdApi.Plugins.disable('ModeratorTools')
                                return BdApi.showToast('Необходимо заполнить все поля!', {type: "error"})
                            }
                            cache.token = document.querySelector(".inputDefault-3FGxgL").value.trim() || cache.token
                            return endModal()
                        }
                    }
                )
            }

            // Окно подтверждения
            function endModal() {
                BdApi.showConfirmationModal(`Подтверждение`,
                    [
                        "Вы уже близки к концу! Осталось только подтвердить ранее введённые данные, и вы сможете вернуться к работе",
                        BdApi.React.createElement("div", {style: {"min-height": "15px", "min-width": "15px"}}),
                        `Уровень вашей должности: ${cache.staff}`,
                        `Ваш префикс: ${cache.prefix}`,
                        dev ? `Ваш токен GitHub: ${cache.token}` : null,
                        BdApi.React.createElement("div", {style: {"min-height": "15px", "min-width": "15px"}}),
                        "Все данные введены верно?",
                        BdApi.React.createElement("div", {style: {"min-height": "15px", "min-width": "15px"}}),
                        "Примечание: Вы сможете изменить введённые данные в любое время через настройки плагинов"
                    ],
                    {
                        confirmText: "Да",
                        cancelText: "Назад",
                        onCancel: _ => {
                            return dev ? tokenModal() : helpModal()
                        },
                        onConfirm: _ => {
                            let data = new ModeratorTools().getData("buttons").role
                            data.content = cache.roleHelp
                            new ModeratorTools().setData("user", {
                                "staff": cache.staff,
                                "prefix": cache.prefix,
                                "forms": cache.forms,
                                "token": cache.token
                            })
                            cache = {}
                            BdApi.showToast("Moderator Tools: Настройки сохранены!", {type: "success"});
                            new ZLibrary.Tooltip(document.querySelectorAll(".username-h_Y3Us")[document.querySelectorAll(".username-h_Y3Us").length - 1], "Кликните два раза чтобы сохранить ID пользователя! (в плагин)", {
                                style: "green",
                                disabled: true
                            }).show()
                            return new ModeratorTools().start();
                        }
                    }
                )
            }

            // Запуск мастера настройки
            return beginModal()
        }

        // Старт плагина
        this.interval = setInterval(() => {
            if (!document.querySelector(".sansAttachButton-1ERHue")) return;
            clearInterval(this.interval);
            return this.start();
        }, 2000);
    }

    async start() {

        if (!global.ZeresPluginLibrary) return;
        pasteMessage.authToken = ZLibrary.DiscordModules.UserInfoStore.getToken()

        // Кеширование правил сервера
        if (!headers.length || !rules.length) {
            const messages = JSON.parse(pasteMessage.requestData("/api/v9/channels/493181631239028736/messages?after=938512999457628200")).reverse()
            messages.forEach(message => {
                if (message.content.includes("**")) headers.push(message.content.split("**")[1])
                let raw = message.content.split("```")[1].split("\n").slice(1)
                raw = raw.slice(0, raw.indexOf(""))
                let index = raw[0].slice(0, 1)
                for (let i = 0; i < raw.length; i++) {
                    if (!raw[i - 1]) continue;
                    if (!isNaN(raw[i - 1][0]) && isNaN(raw[i][0])) {
                        raw[i - 1] = raw[i - 1] + "<br>" + raw[i]
                        raw.splice(i, 1)
                        i--
                    }
                }
                if (rules[index - 1]) return rules[index - 1].push(...raw)
                return rules[index - 1] = raw
            })
        }

        commands = Object.entries(this.getData("buttons") || {})

        // Автообновление плагина
        if (dev && this.getData("user")?.token) {
            let raw = decodeURIComponent(escape(window.atob(JSON.parse(pasteMessage.requestData("https://api.github.com/repos/Pavel-Boyazov/moderator-tools-dev/contents/ModeratorTools.plugin.js/")).content)))
            if (ZLibrary.PluginUpdater.defaultComparator(this.getVersion(), ZLibrary.PluginUpdater.defaultVersioner(raw))) {
                let req = new XMLHttpRequest();
                req.open("POST", "https://api.github.com/gists", false);
                req.setRequestHeader("authorization", "token " + this.getData("user")?.token);
                req.setRequestHeader("content-type", "application/json");
                req.send(JSON.stringify({files: {"ModeratorTools.plugin.js": {content: raw}}}));
                req.onload = () => {
                    let err = pasteMessage.strerror(req);
                    if (err) BdApi.showToast(`Moderator Tools: Error: ${err}`, {type: "error"});
                };
                let gistID = JSON.parse(req.response).id;
                ZLibrary.PluginUpdater.checkForUpdate(this.getName(), this.getVersion(), JSON.parse(req.response).files["ModeratorTools.plugin.js"].raw_url);
                ZLibrary.PluginUpdater.downloadPlugin(this.getName(), JSON.parse(req.response).files["ModeratorTools.plugin.js"].raw_url);
                setTimeout(() => {
                    let req = new XMLHttpRequest();
                    req.open("DELETE", "https://api.github.com/gists/" + gistID, false);
                    req.setRequestHeader("authorization", "token " + this.getData("user")?.token);
                    req.send();
                    req.onload = () => {
                        let err = pasteMessage.strerror(req);
                        if (err) BdApi.showToast(`Moderator Tools: Error: ${err}`, {type: "error"});
                    };
                }, 5000);
            }
        } else if (!dev || !this.getData("user")?.token) ZLibrary.PluginUpdater.checkForUpdate(this.getName(), this.getVersion(), "https://raw.githubusercontent.com/Pavel-Boyazov/moderator-tools/main/ModeratorTools.plugin.js");

        // Отображение ChangeLog'a
        if ((this.getData("info")?.version != this.getVersion() || !this.getData("info")?.changeLog) && this.getData("info")) {
            this.showChangeLog()
            this.setData("info", {
                version: this.getVersion(),
                cfgVersion: this.getData("info").cfgVersion,
                changeLog: true
            })
        }

        if (!this.getData("user") || JSON.stringify(this.getData("user")) == "{}") return;

        // Автообновление конфига
        let config = JSON.parse(pasteMessage.requestData("https://pavel-boyazov.github.io/settings_03.json"));
        if (ZLibrary.PluginUpdater.defaultComparator(this.getData("info")?.cfgVersion || "0.0.0", config.version)) {
            if (ZLibrary.PluginUpdater.defaultComparator(this.getVersion(), config.requiredVersion)) return /*BdApi.showToast("Доступна новая версия конфига! Обновите плагин до актуальной версии для его загрузки", { type: "warning" })*/;
            commands.forEach(command => {
                if (command[1].editable) config.buttons[command[0]].content = command[1].content;
            });
            this.setData("info", {
                version: this.getVersion(),
                cfgVersion: config.version,
                changeLog: this.getData("info")?.changeLog || false
            });
            this.setData("buttons", config.buttons);
            this.setData("folders", config.folders);
            this.setData("server", config.server);
            BdApi.showToast("Конфиг был успешно автоматически обновлён до версии " + config.version, {type: "success"})
        }

        // Открытие WebSocket'a для принятия форм
        if (+this.getData("user").staff > 1 && this.getData("user").forms && (socket?.readyState == 2 || socket?.readyState == 3 || !socket)) WS.open()

        // Создание кнопки для открытия панели
        let textArea = document.querySelector(".sansAttachButton-1ERHue")
        if (!textArea) return;
        if (document.querySelector("#openDashboardButton")) return;
        let openButton = document.createElement("button")
        openButton.type = "button"
        openButton.id = "openDashboardButton"
        openButton.classList = "leftTrayIcon-3kMl25 arrow-3MeJHj button-f2h6uQ lookBlank-21BCro colorBrand-I6CyqQ grow-2sR_-F"
        openButton.onclick = () => {
            if (!opened) {
                if (document.URL.split('/')[4] != this.getData("server").id) return BdApi.showToast("ModeratorTools недоступен для использования на данном сервере!", {type: "error"});
                this.showDashboard()
                return document.querySelector("#openDashboardButton div svg").style.transform = "rotate(180deg)"
            }
            if (pasteMessage.flood) return BdApi.showToast("Нельзя закрывать во время флуда!", {type: "error"})
            this.closeDashboard()
            return document.querySelector("#openDashboardButton div svg").style.transform = ""
        }
        openButton.innerHTML = '<div class="contents-1UYEBX lineHeightReset-1WxXXk"><svg class="arrow-gKvcEx controlIcon-1grhw_" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M16.59 8.59004L12 13.17L7.41 8.59004L6 10L12 16L18 10L16.59 8.59004Z"></path></svg></div>'
        document.querySelector(".sansAttachButton-1ERHue").prepend(openButton)
        if (!opened) document.querySelector("#openDashboardButton div svg").style.transform = ""
        else {
            if (document.URL.split('/')[4] != this.getData("server").id) {
                opened = false;
                return BdApi.showToast("ModeratorTools недоступен для использования на данном сервере!", {type: "error"});
            }
            this.showDashboard()
            // Да это дичь, но так оно хотя бы работает
            setTimeout(() => document.querySelector("#openDashboardButton div svg").style.transform = "rotate(180deg)", 0)
        }
        if (!pasteMessage.flood) document.querySelector("#openDashboardButton div svg").style.transform = ""
        else {
            this.stopButton()
            setTimeout(() => document.querySelector("#openDashboardButton div svg").style.transform = "rotate(180deg)", 0)
        }

        // Запоминание ID по клику на ник
        document.ondblclick = (e) => {
            if (e.target.classList.value == "username-h_Y3Us desaturateUserColors-1O-G89 clickable-31pE3P") {
                let avatarURL = e.target.parentNode.parentNode.parentNode.firstChild.getAttribute("src")
                if (!avatarURL.startsWith("/ass")) {
                    saved_id = avatarURL.split("/")[4]
                    BdApi.showToast(`ID ${saved_id} сохранён!`, {type: "success"})
                    clearTimeout(this.timeout)
                    this.timeout = setTimeout(() => {
                        BdApi.showToast(`ID ${saved_id} был удалён!`, {type: "error"})
                        saved_id = ""
                    }, 20000)
                } else {
                    let message_id = e.target.parentNode.getAttribute("id").slice(17)
                    let channel_id = ZLibrary.DiscordModules.SelectedChannelStore.getChannelId()
                    saved_id = JSON.parse(pasteMessage.requestData(`/api/v9/channels/${channel_id}/messages?limit=1&around=${message_id}`))[0].author.id
                    BdApi.showToast(`ID ${saved_id} сохранён!`, {type: "success"})
                    clearTimeout(this.timeout)
                    this.timeout = setTimeout(() => {
                        BdApi.showToast(`ID ${saved_id} был удалён!`, {type: "error"})
                        saved_id = ""
                    }, 20000)
                }
            }
        }
    }

    onSwitch() {
        clearTimeout(WS.closeTime)
        this.start()
    }

    stop() {
        document.querySelector("#SupportDashboard")?.remove()
        document.querySelector("#FolderDashboard")?.remove()
        document.querySelector("#openDashboardButton")?.remove()
        clearInterval(pasteMessage.flood)
        document.querySelector("#StopButton")?.remove()
        clearTimeout(WS.closeTime)
        document.querySelector("#acceptForm")?.remove()
        if (socket?.readyState == 1 || socket?.readyState == 0) WS.close()
        document.ondblclick = {}
    }

    showDashboard() {
        opened = true
        let chat = document.querySelector(".chatContent-3KubbW")
        if (!chat) return;
        if (document.querySelector("#SupportDashboard")) return;
        document.querySelector("#acceptForm")?.remove()
        let dashboard = GUI.newHBox();
        dashboard.classList.add("mtools-dashboard")
        dashboard.id = "SupportDashboard"
        let createdFolders = []
        let usedButttons = []
        let folders = this.getData("folders")
        commands.forEach(command => {
            if (this.getData("user").staff < command[1].staff && !command[1].form) return
            Object.keys(folders).forEach(name => {
                if (folders[name].includes(command[0])) {
                    usedButttons.push(command)
                    if (createdFolders.includes(name)) return;
                    if (!ZLibrary.DiscordModules.ChannelStore.getChannel(
                        ZLibrary.DiscordModules.SelectedChannelStore.getChannelId()).name.startsWith(command[1].require || "")) return;
                    let button = GUI.newButton("📁 " + name)
                    button.classList.add("mtools-button")
                    button.onclick = () => this.openFolder(folders[name])
                    createdFolders.push(name)
                    return dashboard.append(button)
                }
            })
            if (usedButttons.includes(command)) return;
            let button = GUI.newConfirm(command[0])
            if (!button) return;
            return dashboard.append(button)
        });
        chat.append(dashboard)
    }

    closeDashboard() {
        opened = false
        document.querySelector("#SupportDashboard")?.remove()
        document.querySelector("#FolderDashboard")?.remove()
        clearTimeout(WS.closeTime)
        document.querySelector("#acceptForm")?.remove()
    }

    openFolder(commands) {
        let chat = document.querySelector(".chatContent-3KubbW")
        if (!chat) return;
        let dashboard = GUI.newHBox();
        dashboard.classList.add("mtools-dashboard")
        dashboard.id = "FolderDashboard"
        let backButton = GUI.setRed(GUI.newButton("Назад"))
        backButton.classList.add("mtools-button")
        backButton.addEventListener("click", () => {
            document.querySelector("#FolderDashboard").remove()
            return this.showDashboard()
        })
        dashboard.append(backButton)
        commands.forEach(command => {
            let button = GUI.newConfirm(command)
            if (!button) return;
            dashboard.append(button)
        })
        document.querySelector("#SupportDashboard").remove()
        chat.append(dashboard)
    }

    stopButton() {
        let chat = document.querySelector(".chatContent-3KubbW")
        if (!chat) return;
        let dashboard = GUI.newHBox();
        dashboard.classList.add("mtools-dashboard")
        dashboard.id = "StopButton"
        let stopButton = GUI.setRed(GUI.newButton("СТОП!"))
        stopButton.classList.add("mtools-button")
        stopButton.addEventListener("click", () => {
            clearInterval(pasteMessage.flood)
            pasteMessage.flood = undefined
            document.querySelector("#StopButton").remove()
            return this.start()
        })
        dashboard.append(stopButton)
        document.querySelector("#SupportDashboard")?.remove()
        document.querySelector("#FolderDashboard")?.remove()
        chat.append(dashboard)
    }

    showForm(message) {
        let chat = document.querySelector(".chatContent-3KubbW");
        if (!chat) return;
        WS.cache = message.content.replace('\\', '');
        let dashboard = GUI.newHBox();
        dashboard.classList.add("mtools-dashboard")
        dashboard.id = "acceptForm";
        let formText = GUI.newInput("Форма", `${message.member.nick || message.author.username}: ${message.content.replace('\\', '')}`, true);
        formText.classList.add("mtools-button")
        let acceptButton = GUI.setGreen(GUI.newButton("Принять форму"));
        acceptButton.classList.add("mtools-button")
        let declineButton = GUI.setRed(GUI.newButton("Отклонить форму"));
        declineButton.classList.add("mtools-button")
        acceptButton.addEventListener("click", () => {
            pasteMessage.request("", {channel: message.channel_id}).send(JSON.stringify({content: message.content.replace('\\', '')}));
            pasteMessage.request("reaction", {channel: message.channel_id, message: message.id, reaction: "✅"}).send();
            BdApi.showToast("Форма принята", {type: "success"});
            clearTimeout(WS.closeTime);
            document.querySelector("#acceptForm").remove();
            if (document.URL.split('/')[4] != this.getData("server").id) return;
            return opened ? this.showDashboard() : null;
        });
        declineButton.addEventListener("click", () => {
            pasteMessage.request("reaction", {channel: message.channel_id, message: message.id, reaction: "❌"}).send();
            BdApi.showToast("Форма отказана", {type: "error"});
            clearTimeout(WS.closeTime);
            document.querySelector("#acceptForm").remove();
            if (document.URL.split('/')[4] != this.getData("server").id) return;
            return opened ? this.showDashboard() : null;
        });
        dashboard.append(formText);
        dashboard.append(acceptButton);
        dashboard.append(declineButton);
        document.querySelector("#SupportDashboard")?.remove();
        document.querySelector("#FolderDashboard")?.remove();
        chat.append(dashboard);
    }

    async showRules(help, user) {
        let points = []
        let sendable = []
        headers.map(header => {
            points.push(BdApi.React.createElement("div", {
                className: "markdown-19oyJN section-header",
                style: {fontSize: "125%", cursor: "help", userSelect: "none", margin: "5px"},
                onClick: (e) => {
                    if (document.querySelector(".rules-container .rules-section[style*='display: block']") && document.querySelector(".rules-container .rules-section[style*='display: block']") != e.target.nextElementSibling)
                        document.querySelector(".rules-container .rules-section[style*='display: block']").style.display = "none";
                    e.target.nextElementSibling.style.display = e.target.nextElementSibling.style.display == "none" ? "block" : "none"
                }
            }, header))
            points.push(BdApi.React.createElement("div", {
                    className: "markdown-19oyJN rules-section",
                    style: {display: "none"}
                },
                BdApi.React.createElement("div", {style: {"min-height": "15px", "min-width": "15px"}}),
                rules[headers.indexOf(header)].map(rule => BdApi.React.createElement("div", {
                    className: "section-rule", Selected: "false", onClick: (e) => {
                        if (JSON.parse(e.target.getAttribute("Selected"))) {
                            e.target.style.outlineStyle = "none"
                            sendable.splice(sendable.indexOf(help ? `\`${e.target.innerText}\`` : e.target.innerText.split(")")[0]), 1)
                            return e.target.setAttribute("Selected", "false")
                        }
                        e.target.style.outlineStyle = "solid"
                        sendable.push(help ? `\`${e.target.innerText}\`` : e.target.innerText.split(")")[0])
                        return e.target.setAttribute("Selected", "true")
                    }, dangerouslySetInnerHTML: {__html: rule}
                })),
                BdApi.React.createElement("div", {style: {"min-height": "15px", "min-width": "15px"}})),
            )
        })
        await BdApi.showConfirmationModal("Правила", [
                GUI.newReactInput("Поиск"),
                BdApi.React.createElement("div", {style: {"min-height": "15px", "min-width": "15px"}}),
                BdApi.React.createElement(
                    "div", {className: "rules-container"},
                    ...points
                )
            ],
            {
                confirmText: "Отправить",
                cancelText: "Назад",
                onConfirm: _ => {
                    if (sendable.length == 0) return BdApi.showToast("Отсутствуют выбранные элементы!", {type: "warning"});
                    const buttonsConfig = new ModeratorTools().getData("buttons")
                    const commandConfig = buttonsConfig["rules"]
                    if (help) return pasteMessage.send(commandConfig, {user, raw_content: sendable.join("\n")});
                    if (!document.querySelector("input[name=reason]")) return BdApi.showToast(`Moderator Tools: Внутренняя ошибка. Сообщите мне vk.com/Pavel_Boyazov`, {type: "error"});
                    return document.querySelector("input[name=reason]").value = sendable.join(", ");
                }
            })

        // Поиск
        document.querySelector("input[placeholder=Поиск]").addEventListener("input", e => {
            if (e.target.value.length == 0 || e.target.value.length == 1) {
                document.querySelectorAll(".rules-container .rules-section").forEach(section => {
                    section.style.display = "none";
                    section.childNodes.forEach(element => {
                        element.style.display = "block";
                    })
                    return section.previousElementSibling.style.display = "block";
                })
            } else {
                document.querySelectorAll(".rules-container .rules-section").forEach(section => {
                    section.style.display = "block";
                    section.childNodes.forEach(element => {
                        element.style.display = "none";
                        if (element.innerText.includes(e.target.value)) {
                            element.style.display = "block"
                            section.firstChild.style.display = "block"
                            section.lastChild.style.display = "block"
                        }
                    })
                    if (section.querySelector("div[style*='display: none']") && !section.querySelector("div[style*='display: block']")) return section.previousElementSibling.style.display = "none";
                    section.previousElementSibling.style.display = "block";
                })
            }
        })
    }

    newRow(button, key) {
        let hbox = GUI.newHBox();

        let keyWidget = GUI.newInput();
        keyWidget.disabled = true
        keyWidget.style.width = "140px";
        keyWidget.style.marginRight = "15px";
        if (key != undefined) keyWidget.value = key;
        hbox.appendChild(keyWidget);

        let textWidget = GUI.newTextarea("Текст", button.content?.trim());
        textWidget.style.marginRight = "15px";
        textWidget.addEventListener('input', () => {
            if (textWidget.scrollTop > 0) {
                textWidget.style.height = textWidget.scrollHeight + 2 + "px";
            }
        });
        hbox.appendChild(textWidget);

        return hbox;
    }

    jsonToEdit(json) {
        if (!json) return undefined;
        let out = document.createElement("div");

        Object.keys(json).forEach(key => {
            if (this.getData("user")?.staff || 1 < json[key].staff) return undefined;
            let row = this.newRow(json[key], key)
            row.style.marginTop = "15px";
            out.appendChild(row);
        })

        return out;
    }

    editToJson(json, editor) {
        editor.childNodes.forEach(child => {
            let inputs = child.childNodes
            json[inputs[0].value].content = inputs[1].value.trim()
        })
        return json
    }

    getSettingsPanel() {
        let settings = document.createElement("div");
        settings.style.padding = "10px";

        settings.appendChild(GUI.newDivider());

        // Должность
        settings.appendChild(GUI.newLabel("Ваш уровень модератора"));
        let staff = GUI.newInput("1 - SP, 2 - ST, 3 - Куратор, 4 - DG, 5 - DM", +this.getData("user")?.staff);
        staff.setAttribute("type", "number");
        staff.min = 0
        staff.max = 5
        settings.appendChild(staff);

        settings.appendChild(GUI.newDivider());

        // Префикс
        settings.appendChild(GUI.newLabel("Ваш префикс"));
        let prefix = GUI.newInput();
        prefix.value = this.getData("user")?.prefix ? this.getData("user")?.prefix : "";
        settings.appendChild(prefix);

        settings.appendChild(GUI.newDivider());

        // Токен
        if (dev) {
            settings.appendChild(GUI.newLabel("Ваш токен GitHub"));
            var token = GUI.newInput();
            token.type = "password"
            token.value = this.getData("user")?.token ? this.getData("user")?.token : "";
            settings.appendChild(token);
            let button = GUI.setRed(GUI.newButton("Показать токен", false))
            button.onclick = () => {
                if (document.querySelector("input[type=password")) {
                    document.querySelector("input[type=password").type = "token"
                    button.innerText = "Скрыть токен"
                } else if (document.querySelector("input[type=token")) {
                    document.querySelector("input[type=token").type = "password"
                    button.innerText = "Показать токен"
                }
            }
            settings.appendChild(button);

            settings.appendChild(GUI.newDivider());
        }

        // Формы
        let row = GUI.newHBox()
        settings.appendChild(row)
        settings.appendChild(GUI.newDivider())
        if (+this.getData("user")?.staff > 1 && !document.querySelector("div.bd-switch input[name=form]")) {
            row.appendChild(GUI.newLabel("Принимать формы?"))
            let t = document.createElement("div")
            t.innerHTML = '<div class="bd-switch bd-switch-checked"><input type="checkbox" name="form" ' + `${this.getData("user").forms ? 'checked' : ''}` + '><div class="bd-switch-body"><svg class="bd-switch-slider" viewBox="0 0 28 20" preserveAspectRatio="xMinYMid meet"><rect class="bd-switch-handle" fill="white" x="4" y="0" height="20" width="20" rx="10"></rect><svg class="bd-switch-symbol" viewBox="0 0 20 20" fill="none"><path></path><path></path></svg></svg></div></div>'
            t.style.position = "absolute"
            t.style.right = "18px"
            row.appendChild(t)
        }
        staff.addEventListener('focusout', () => {
            if (document.querySelector("div.bd-switch input[name=form]") || +staff.value.trim() < 2) return;
            row.appendChild(GUI.newLabel("Принимать формы?"))
            let t = document.createElement("div")
            t.innerHTML = '<div class="bd-switch bd-switch-checked"><input type="checkbox" name="form" ' + `${this.getData("user").forms ? 'checked' : ''}` + '><div class="bd-switch-body"><svg class="bd-switch-slider" viewBox="0 0 28 20" preserveAspectRatio="xMinYMid meet"><rect class="bd-switch-handle" fill="white" x="4" y="0" height="20" width="20" rx="10"></rect><svg class="bd-switch-symbol" viewBox="0 0 20 20" fill="none"><path></path><path></path></svg></svg></div></div>'
            t.style.position = "absolute"
            t.style.right = "18px"
            row.appendChild(t)
        });

        // Текст команд
        settings.appendChild(GUI.newLabel('Редактирование команд'));
        let div = GUI.newLabel('Редактирование команд');
        div.style.textTransform = "none";
        div.innerText = 'Доступно использование переменных {user}, {time}, {reason}, {url}';
        settings.appendChild(div);
        let helpContainer = document.createElement("div");
        settings.appendChild(helpContainer);

        // Действия
        settings.appendChild(GUI.newDivider());
        let actions = GUI.newHBox();
        settings.appendChild(actions);

        let editor = undefined
        let helpCmds = {}
        commands.forEach(command => {
            if (command[1].editable) helpCmds[command[0]] = command[1]
        })
        if (this.getData("buttons")) {
            editor = this.jsonToEdit(helpCmds);
            helpContainer.appendChild(editor);
            actions.style.display = "flex";
        }

        // Кнопки снизу
        let changeLog = GUI.newButton("Просмотреть ChangeLog");
        GUI.setBlue(changeLog, true);
        actions.appendChild(changeLog);
        changeLog.onclick = () => this.showChangeLog()

        // Прижать кнопку сохранения вправо
        actions.appendChild(GUI.setExpand(GUI.newDivider(), 2));

        let save = GUI.newButton("Сохранить");
        GUI.setGreen(save, true);
        actions.appendChild(save);
        save.onclick = () => {
            let allInputs = document.querySelectorAll(".inputDefault-3FGxgL")
            for (var i = 0; i < allInputs.length; i++) if (allInputs[i]?.value == "") return BdApi.showToast("Необходимо заполнить все поля!", {type: "error"})
            allInputs = document.querySelectorAll(".scrollbarGhostHairline-2LpzZ9")
            for (var i = 0; i < allInputs.length; i++) if (allInputs[i]?.value == "") return BdApi.showToast("Необходимо заполнить все поля!", {type: "error"})
            try {
                // Установить должность и префикс
                this.setData("user", {
                    "staff": staff.value.trim(),
                    "prefix": prefix.value.trim(),
                    "forms": +staff.value.trim() > 1 ? document.querySelector("div.bd-switch input[name=form]")?.checked || false : false,
                    "token": token?.value?.trim()
                });
                if (editor) this.setData("buttons", this.editToJson(this.getData("buttons"), editor))

                // Перезагрузка плагина
                this.stop()
                this.load()
            } catch (e) {
                return BdApi.showToast(e, {type: "error"});
            }

            BdApi.showToast("Moderator Tools: Настройки сохранены!", {type: "success"});
        };
        return settings;
    }
}

const pasteMessage = {
    authToken: undefined,

    strerror: (req) => {
        if (req.status < 400)
            return undefined;

        if (req.status == 401)
            return "Invalid AuthToken";

        if (req.status == 429)
            return "Вы не можете так часто отправлять сообщения";

        let json = JSON.parse(req.response);
        for (const s of ["errors", "custom_status", "text", "_errors", 0, "message"])
            if ((json == undefined) || ((json = json[s]) == undefined))
                return "Внутренняя ошибка. Сообщите мне vk.com/Pavel_Boyazov";

        return json;
    },

    requestData: (URL) => {
        let req = new XMLHttpRequest();
        req.open("GET", URL, false);
        if (URL.startsWith("/api/v9/")) req.setRequestHeader("authorization", pasteMessage.authToken);
        if (URL.startsWith("https://api.github.com/")) {
            req.setRequestHeader("authorization", "token " + new ModeratorTools().getData("user")?.token);
        }
        ;
        req.send();
        req.onload = () => {
            let err = pasteMessage.strerror(req);
            if (err) BdApi.showToast(`Moderator Tools: Error: ${err}`, {type: "error"});
        };
        return req.response;
    },

    request: (type, args = {message: "", user: "", role: "", channel: "", reaction: ""}) => {
        let req = new XMLHttpRequest();
        let method = "POST"
        let url = `/api/v9/channels/${args.channel || ZLibrary.DiscordModules.SelectedChannelStore.getChannelId()}/messages`
        if (type == "role") {
            method = "PUT"
            url = `/api/v9/guilds/${document.URL.split('/')[4]}/members/${args.user}/roles/${args.role}`
        }
        if (type == "reaction") {
            method = "PUT"
            url = `/api/v9/channels/${args.channel}/messages/${args.message}/reactions/${args.reaction}/@me`
        }
        req.open(method, url, true);
        req.setRequestHeader("authorization", pasteMessage.authToken);
        req.setRequestHeader("content-type", "application/json");
        req.onload = () => {
            let err = pasteMessage.strerror(req);
            if (err) BdApi.showToast(`Moderator Tools: Error: ${err}`, {type: "error"});
        };
        return req;
    },

    send: function (command, values = {user: "", time: "", reason: "Причина не указана", link: "", raw_content: ""}) {
        const userConfig = new ModeratorTools().getData('user')
        let content = command.content || values.raw_content

        if (!content) return BdApi.showToast(`Moderator Tools: Внутренняя ошибка. Сообщите мне vk.com/Pavel_Boyazov`, {type: "error"});
        if (command.type == "messages") {
            let strings = content.split("\n")
            new ModeratorTools().stopButton()
            var i = -1;
            var channel = ZLibrary.DiscordModules.SelectedChannelStore.getChannelId()
            this.flood = setInterval(() => {
                i++
                if (i == strings.length) {
                    clearInterval(this.flood)
                    this.flood = undefined;
                    document.querySelector("#StopButton")?.remove()
                    BdApi.showToast("Флуд окончен!", {type: "success"})
                    if (document.URL.split('/')[4] != new ModeratorTools().getData("server").id) return BdApi.showToast("ModeratorTools недоступен для использования на данном сервере!", {type: "error"});
                    return new ModeratorTools().showDashboard()
                }
                pasteMessage.request(command.type, {channel}).send(JSON.stringify({content: strings[i]}))
            }, 3000)
        }
        if (command.type == "message" || command.type == "rules") {
            content = content
                .replace("{user}", values.user || "")
                .replace("{time}", values.time || "")
                .replace("{reason}", values.reason || "Причина не указана")
                .replace("{url}", values.link || "")
            if (command.form && userConfig.staff < command.staff) {
                content = `\\${content} ${userConfig.prefix}`
            }
            if (command.target == "help" && values.user) {
                content = `<@${values.user}>, ${content}`
            }
            return pasteMessage.request(command.type).send(JSON.stringify({content}))
        }
        if (command.type == "role") return pasteMessage.request(command.type, {user: values.user, role: content}).send()
    },

    checkUser: function (user, func, ...args) {
        let req = new XMLHttpRequest();
        req.open("GET", `/api/v9/guilds/${new ModeratorTools().getData("server").id}/members/${user}`, false);
        req.setRequestHeader("authorization", this.authToken);
        req.send();
        if (req.status == 404) return BdApi.showConfirmationModal("Предупреждение!",
            [`Пользователь с ID ${user} отсутствует на сервере! Вы уверены что хотите отправить форму?`],
            {
                cancelText: "Отмена",
                confirmText: "Отправить",
                onConfirm: _ => func(...args),
                danger: true
            }
        );
        if (req.status == 400) return BdApi.showToast("Указан неверный ID!", {type: "error"});
        func(...args)
    }
};

const GUI = {
    newInput: (placeholder = "", value = "", disabled = false) => {
        let input = document.createElement("input");
        input.className = "inputDefault-3FGxgL input-2g-os5";
        input.disabled = disabled;
        input.value = value;
        input.placeholder = placeholder;
        return input;
    },

    newReactInput: (placeholder = "", name = "", value = "", disabled = false) => {
        if (value) return BdApi.React.createElement(
            "input",
            {
                className: "inputDefault-3FGxgL input-2g-os5",
                name, value, placeholder, disabled,
                onKeyPress: (e) => {
                    if (e.charCode === 13) document.querySelector("button[type=submit]").click()
                }
            }
        );
        return BdApi.React.createElement(
            "input",
            {
                className: "inputDefault-3FGxgL input-2g-os5",
                name, placeholder, disabled,
                onKeyPress: (e) => {
                    if (e.charCode === 13) document.querySelector("button[type=submit]").click()
                }
            }
        );
    },

    newLabel: (text) => {
        let label = document.createElement("h5");
        label.className = "h5-2RwDNl";
        label.innerText = text;
        return label;
    },

    newDivider: (size = "15px") => {
        let divider = document.createElement("div");
        divider.style.minHeight = size;
        divider.style.minWidth = size;
        return divider;
    },

    newTextarea: (placeholder = "", text = "") => {
        let textarea = document.createElement("textarea");
        textarea.className = "input-2g-os5 scrollbarGhostHairline-2LpzZ9";
        textarea.placeholder = placeholder;
        textarea.value = text;
        textarea.style.resize = "vertical";
        textarea.rows = Math.floor(text?.length / 48) + 1 || 4;
        return textarea;
    },

    newReactTextarea: (placeholder = "", rows = 2) => {
        return BdApi.React.createElement("textarea", {
            className: "input-2g-os5 scrollbarGhostHairline-2LpzZ9",
            placeholder,
            style: {resize: "vertical"},
            rows
        })
    },

    newButton: (text, filled = true) => {
        let button = document.createElement("button");
        button.className = "button-f2h6uQ colorBrand-I6CyqQ sizeSmall-wU2dO- grow-2sR_-F";
        if (filled) button.classList.add("lookFilled-yCfaCM");
        else button.classList.add("lookOutlined-3yKVGo");
        button.innerText = text;
        return button;
    },

    newHBox: (flexDirection = "row") => {
        let hbox = document.createElement("div");
        hbox.style.display = "flex";
        hbox.style.flexDirection = flexDirection;
        return hbox;
    },

    newReactHBox: (...elements) => {
        return BdApi.React.createElement("div", {style: {display: "flex", flexDirection: "row"},}, [elements]);
    },

    newConfirm: (command) => {
        const buttonsConfig = new ModeratorTools().getData("buttons")
        const commandConfig = buttonsConfig[command]
        let button
        switch (commandConfig.color) {
            case "red":
                button = GUI.setRed(GUI.newButton(command, true))
                break;

            case "yellow":
                button = GUI.setYellow(GUI.newButton(command, true))
                break;

            case "blue":
                button = GUI.setBlue(GUI.newButton(command, true))
                break;

            case "green":
                button = GUI.setGreen(GUI.newButton(command, true))
                break;

            default:
                button = GUI.newButton(command, true)
        }

        button.classList.add("mtools-button")

        button.onclick = () => {
            let inputs = [];
            if (commandConfig.type == "messages" && !commandConfig.content) inputs.push("Многострочный текст", GUI.newReactTextarea(commandConfig.placeholder, 10))
            if (commandConfig.type != "messages" && (commandConfig.content?.includes('{user}') || commandConfig.target == "help")) inputs.push(commandConfig.target == "help" ? "Кому нужна помощь?" : "Пользователь", GUI.newReactInput("id пользователя", "user", saved_id, Boolean(saved_id)))
            commandConfig.content?.includes('{time}') ? inputs.push("Срок", GUI.newReactInput("срок", "time")) : null;
            commandConfig.content?.includes('{reason}') ? inputs.push("Причина", GUI.newReactHBox(
                GUI.newReactInput("причина", "reason"),
                BdApi.React.createElement("button", {
                    onClick: _ => new ModeratorTools().showRules(),
                    dangerouslySetInnerHTML: {__html: `<svg width="24" height="24" viewBox="0 0 40 40" fill="none" class="icon-2W8DHg"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M33 34.5833V7.49998H35V36.6666H9C6.791 36.6666 5 34.801 5 32.5V7.49998C5 5.19894 6.791 3.33331 9 3.33331H31V30.4166H9C7.8955 30.4166 7 31.3485 7 32.5C7 33.6515 7.8955 34.5833 9 34.5833H33ZM23.9718 9.99998L15.8889 17.9915L12.7086 14.8441L10 17.5058L15.8885 23.3333L26.6667 12.6669L23.9718 9.99998Z"></path></svg>`}
                })
            )) : null;
            commandConfig.content?.includes('{url}') ? inputs.push("Ссылка", GUI.newReactInput("ссылка", "link")) : null
            for (var i = 2; i < inputs.length; i += 3) inputs.splice(i, 0, BdApi.React.createElement("div", {
                style: {
                    "min-height": "15px",
                    "min-width": "15px"
                }
            }));
            if (inputs.length == 0) return pasteMessage.send(commandConfig)
            BdApi.showConfirmationModal(commandConfig.title,
                inputs,
                {
                    confirmText: "Отправить",
                    cancelText: "Назад",
                    onConfirm: _ => {
                        let allInputs = commandConfig.type == "messages" ? document.querySelector(".input-2g-os5") : document.querySelectorAll(".inputDefault-3FGxgL")
                        let values = {}
                        if (commandConfig.type == "messages") {
                            values["raw_content"] = allInputs.value.trim()
                            if (values["raw_content"] == "") return BdApi.showToast("Необходимо заполнить все поля!", {type: "error"})
                            if (!values["raw_content"].toLowerCase().startsWith(commandConfig.check)) return BdApi.showToast("Введены данные неверного формата!", {type: "error"})
                            let channel = JSON.parse(pasteMessage.requestData(`/api/v9/channels/${ZLibrary.DiscordModules.SelectedChannelStore.getChannelId()}`))
                            BdApi.showConfirmationModal("Предупреждение!", [`Вы уверены что хотите запустить флудер в канал **#${channel.name}**?`], {
                                danger: true,
                                confirmText: "Да!",
                                cancelText: "Нет",
                                onConfirm: _ => {
                                    return pasteMessage.send(commandConfig, values)
                                }
                            })
                        } else if (commandConfig.type == "rules") {
                            allInputs.forEach(input => values[input.name] = input.value.trim())
                            if (values["user"] != "") return pasteMessage.checkUser(values["user"], new ModeratorTools().showRules, true, values["user"])
                            return new ModeratorTools().showRules(true)
                        } else {
                            allInputs.forEach(input => values[input.name] = input.value.trim())
                            if (
                                values["user"] == "" &&
                                (commandConfig.target != "help" ||
                                    commandConfig.type != "message")
                            ) return BdApi.showToast("Необходимо заполнить все поля!", {type: "error"})
                            if (values["time"] == "" || values["link"] == "") return BdApi.showToast("Необходимо заполнить все поля!", {type: "error"})
                            if (values["user"] != "") return pasteMessage.checkUser(values["user"], pasteMessage.send, commandConfig, values)
                            return pasteMessage.send(commandConfig, values);
                        }
                    }
                }
            );
        }
        return button
    },

    setExpand: (element, value) => {
        element.style.flexGrow = value;
        return element;
    },

    setGreen: (element) => {
        element.classList.add("colorGreen-3y-Z79");
        return element;
    },

    setYellow: (element) => {
        element.classList.add("colorYellow-Pgtmch");
        return element;
    },

    setBlue: (element) => {
        element.classList.add("colorLink-1Md3RZ");
        return element;
    },

    setRed: (element) => {
        element.classList.add("colorRed-rQXKgM");
        return element;
    }
}

const WS = {
    i: 0,
    open: () => {
        socket = new WebSocket("wss://gateway.discord.gg")
        socket.onmessage = (msg) => {
            let data = JSON.parse(msg.data)
            if (data.op == 9) {
                WS.i++
                if (WS.i == 10) {
                    return console.error('[WebSocket] Превышено количество ошибочных подключений!')
                }
                console.log('[WebSocket] Reconnecting!')
                WS.close()
                WS.open()
            }
            if (data.op == 10) {
                WS.interval = setInterval(() => {
                    if (socket.readyState == 2 || socket.readyState == 3) return clearInterval(WS.interval)
                    socket.send(JSON.stringify({
                        op: 1,
                        d: 2
                    }));
                    console.log("[Hearbeat] Sended!")
                }, data.d.heartbeat_interval)
            }
            if (data.op == 11) return console.log('[Heartbeat] Recieved!')
            let guild = new ModeratorTools().getData("server")
            if (data.d.guild_id != guild.id || data.d.channel_id != guild.moderChat) return
            if (data.t == "MESSAGE_CREATE" && !data.d.author.bot) {
                if (document.querySelector("#StopButton")) return
                commands.forEach(command => {
                    if (!command[1].form || command[1].staff <= 1 || +new ModeratorTools().getData("user").staff < +command[1].staff) return
                    let key = command[1].content.split(" ")
                    if (data.d.content.startsWith(`\\${key[0]}`) || data.d.content.startsWith(`${key[0]}`)) {
                        if (data.d.member.roles.some(role => guild.canAcceptForm.includes(role))) {
                            if (document.querySelector("#acceptForm") && WS.cache == data.d.content) {
                                document.querySelector("#acceptForm").remove()
                                clearTimeout(WS.closeTime)
                                return BdApi.showToast("Форма принята другим модератором", {type: "error"})
                            }
                            return;
                        }
                        document.querySelector("#acceptForm")?.remove()
                        new ModeratorTools().showForm(data.d)
                        WS.closeTime = setTimeout(() => {
                            document.querySelector("#acceptForm")?.remove()
                            BdApi.showToast("Форма пропущена", {type: "error"})
                            if (document.URL.split('/')[4] != this.getData("server").id) return;
                            if (opened) new ModeratorTools().showDashboard()
                            return
                        }, 10000)
                    }
                })
            }
        }
        socket.onopen = function () {
            console.log("[WebSocket] Opened!")
            socket.send(JSON.stringify({
                op: 2,
                d: {
                    token: pasteMessage.authToken,
                    properties: {
                        $os: "Windows",
                        $browser: "my_library",
                        $device: "my_library"
                    }
                }
            }))
        }
        socket.onclose = (e) => console.log("[WebSocket] Socket Closed - " + e.code + " : " + e.reason);
    },
    close: () => {
        socket.close()
        console.log('[WebSocket] Closed!')
    }
}
// Worn With Care: the home-screen and lock-screen widget.
//
// Shows the coat's next care step (brush on Saturdays, steam on the 1st,
// store on 15 April, bring back on 1 October, the same as the app's
// reminders) and how many times it has been worn, in the app's language.
// The app shares the wear count, language and reminder setting through the
// app group "group.care.wornwith.app"; everything else is worked out here.

import WidgetKit
import SwiftUI

private let appGroup = "group.care.wornwith.app"
private let cream = Color(red: 251 / 255, green: 249 / 255, blue: 246 / 255)
private let ink = Color(red: 46 / 255, green: 41 / 255, blue: 37 / 255)
private let clay = Color(red: 111 / 255, green: 102 / 255, blue: 95 / 255)
private let burgundy = Color(red: 142 / 255, green: 61 / 255, blue: 82 / 255)

// MARK: - Care steps (kept in step with src/lib/careReminders.ts)

private enum Rule {
    case weekly(weekday: Int)        // 1 = Sunday … 7 = Saturday
    case monthly(day: Int)
    case yearly(month: Int, day: Int)
}

private struct Step {
    let key: String
    let rule: Rule
}

private let steps: [Step] = [
    Step(key: "brush", rule: .weekly(weekday: 7)),
    Step(key: "steam", rule: .monthly(day: 1)),
    Step(key: "store", rule: .yearly(month: 4, day: 15)),
    Step(key: "return", rule: .yearly(month: 10, day: 1)),
]

private func next(_ rule: Rule, after now: Date, calendar: Calendar) -> Date {
    var parts = DateComponents()
    parts.hour = 9
    parts.minute = 0
    switch rule {
    case .weekly(let weekday): parts.weekday = weekday
    case .monthly(let day): parts.day = day
    case .yearly(let month, let day):
        parts.month = month
        parts.day = day
    }
    return calendar.nextDate(after: now, matching: parts, matchingPolicy: .nextTime) ?? now.addingTimeInterval(86_400)
}

// MARK: - Words

private let words: [String: [String: String]] = [
    "en": [
        "brush": "Brush your coat", "steam": "Steam to refresh",
        "store": "Store it for summer", "return": "Bring it back for autumn",
        "next": "NEXT CARE", "worn": "Worn %d times", "wornOnce": "Worn once",
        "coat": "Black wool coat", "journey": "21,400 km to reach you", "today": "Today",
    ],
    "fr": [
        "brush": "Brossez votre manteau", "steam": "Vaporisez-le",
        "store": "Rangez-le pour l'été", "return": "Ressortez-le pour l'automne",
        "next": "PROCHAIN SOIN", "worn": "Porté %d fois", "wornOnce": "Porté une fois",
        "coat": "Manteau en laine noire", "journey": "21 400 km jusqu'à vous", "today": "Aujourd'hui",
    ],
    "pt": [
        "brush": "Escove o seu casaco", "steam": "Vaporize-o",
        "store": "Guarde-o para o verão", "return": "Volte a usá-lo no outono",
        "next": "PRÓXIMO CUIDADO", "worn": "Usado %d vezes", "wornOnce": "Usado uma vez",
        "coat": "Casaco de lã preta", "journey": "21.400 km até si", "today": "Hoje",
    ],
]

private func say(_ key: String, _ lang: String) -> String {
    words[lang]?[key] ?? words["en"]![key]!
}

// MARK: - Timeline

struct CareEntry: TimelineEntry {
    let date: Date
    let stepKey: String
    let stepDate: Date
    let worn: Int
    let lang: String
}

struct CareProvider: TimelineProvider {
    private func entry(at now: Date) -> CareEntry {
        let shared = UserDefaults(suiteName: appGroup)
        let lang = shared?.string(forKey: "lang") ?? "en"
        let worn = shared?.integer(forKey: "worn") ?? 0
        var calendar = Calendar.current
        calendar.locale = Locale(identifier: lang)
        let upcoming = steps
            .map { ($0.key, next($0.rule, after: now, calendar: calendar)) }
            .min { $0.1 < $1.1 }!
        return CareEntry(date: now, stepKey: upcoming.0, stepDate: upcoming.1, worn: worn, lang: lang)
    }

    func placeholder(in context: Context) -> CareEntry {
        CareEntry(date: Date(), stepKey: "brush", stepDate: Date().addingTimeInterval(2 * 86_400), worn: 18, lang: "en")
    }

    func getSnapshot(in context: Context, completion: @escaping (CareEntry) -> Void) {
        completion(entry(at: Date()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<CareEntry>) -> Void) {
        let now = Date()
        let current = entry(at: now)
        // Redraw just after the step comes due, and at least once a day so
        // "Saturday" becomes "Today" on the day.
        let tomorrow = Calendar.current.startOfDay(for: now).addingTimeInterval(86_400 + 60)
        let refresh = min(current.stepDate.addingTimeInterval(3_600), tomorrow)
        completion(Timeline(entries: [current], policy: .after(refresh)))
    }
}

private func when(_ entry: CareEntry) -> String {
    let calendar = Calendar.current
    if calendar.isDateInToday(entry.stepDate) { return say("today", entry.lang) }
    let formatter = DateFormatter()
    formatter.locale = Locale(identifier: entry.lang)
    let days = calendar.dateComponents([.day], from: calendar.startOfDay(for: entry.date), to: calendar.startOfDay(for: entry.stepDate)).day ?? 0
    formatter.setLocalizedDateFormatFromTemplate(days < 7 ? "EEEE" : "d MMMM")
    return formatter.string(from: entry.stepDate).capitalized(with: formatter.locale)
}

private func wornLine(_ entry: CareEntry) -> String {
    if entry.worn <= 0 { return say("journey", entry.lang) }
    if entry.worn == 1 { return say("wornOnce", entry.lang) }
    return String(format: say("worn", entry.lang), entry.worn)
}

// MARK: - Views

private struct Background: ViewModifier {
    @ViewBuilder
    func body(content: Content) -> some View {
        if #available(iOS 17.0, *) {
            content.containerBackground(cream, for: .widget)
        } else {
            content.padding().background(cream)
        }
    }
}

private struct SmallView: View {
    let entry: CareEntry
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Image("WLogo").resizable().scaledToFit().frame(height: 18)
                Spacer()
            }
            Spacer(minLength: 2)
            Text(say("next", entry.lang))
                .font(.system(size: 9, weight: .semibold)).kerning(1.4).foregroundColor(burgundy)
            Text(say(entry.stepKey, entry.lang))
                .font(.system(size: 17, weight: .medium, design: .serif)).italic()
                .foregroundColor(ink).lineLimit(2).minimumScaleFactor(0.8)
            Text(when(entry))
                .font(.system(size: 12)).foregroundColor(clay)
            Spacer(minLength: 2)
            Text(wornLine(entry))
                .font(.system(size: 11)).foregroundColor(clay).lineLimit(1).minimumScaleFactor(0.8)
        }
    }
}

private struct MediumView: View {
    let entry: CareEntry
    var body: some View {
        HStack(spacing: 14) {
            SmallView(entry: entry)
            Image("Coat")
                .resizable().scaledToFill()
                .frame(width: 110)
                .frame(maxHeight: .infinity)
                .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        }
    }
}

@available(iOS 16.0, *)
private struct LockScreenView: View {
    let entry: CareEntry
    var body: some View {
        VStack(alignment: .leading, spacing: 1) {
            Text(say(entry.stepKey, entry.lang)).font(.system(size: 14, weight: .semibold)).lineLimit(1)
            Text(when(entry)).font(.system(size: 13)).lineLimit(1)
            Text(wornLine(entry)).font(.system(size: 12)).foregroundColor(.secondary).lineLimit(1)
        }
    }
}

struct WornWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: CareEntry

    var body: some View {
        Group {
            if #available(iOS 16.0, *), family == .accessoryRectangular {
                LockScreenView(entry: entry)
            } else if family == .systemMedium {
                MediumView(entry: entry).modifier(Background())
            } else {
                SmallView(entry: entry).modifier(Background())
            }
        }
    }
}

// MARK: - Widget

struct WornWidget: Widget {
    let kind = "WornWidget"

    private var families: [WidgetFamily] {
        if #available(iOS 16.0, *) {
            return [.systemSmall, .systemMedium, .accessoryRectangular]
        }
        return [.systemSmall, .systemMedium]
    }

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CareProvider()) { entry in
            WornWidgetView(entry: entry)
        }
        .configurationDisplayName("Worn With Care")
        .description("Your coat's next care step, and how often you've worn it.")
        .supportedFamilies(families)
    }
}

@main
struct WornWidgetBundle: WidgetBundle {
    var body: some Widget {
        WornWidget()
    }
}

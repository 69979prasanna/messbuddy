import { useState, useMemo, useEffect } from "react"
import "../../styles/MealSchedule.css"

export default function MenuItemPickerModal({
  show,
  onClose,
  day,
  mealMeta,
  selectedItemIds = [],
  selectedCustomItems = [],
  restaurantMenus = [],
  onSave,
}) {
  const [chosenIds, setChosenIds] = useState(
    Array.isArray(selectedItemIds)
      ? selectedItemIds
        .map((item) =>
          typeof item === "object" && item !== null ? item._id : item
        )
        .filter(Boolean)
      : []
  )
  const [customList, setCustomList] = useState(
    Array.isArray(selectedCustomItems)
      ? selectedCustomItems.filter(Boolean)
      : []
  )
  const [customInput, setCustomInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (show) {
      setChosenIds(
        Array.isArray(selectedItemIds)
          ? selectedItemIds
            .map((item) =>
              typeof item === "object" && item !== null ? item._id : item
            )
            .filter(Boolean)
          : []
      )
      setCustomList(
        Array.isArray(selectedCustomItems)
          ? selectedCustomItems.filter(Boolean)
          : []
      )
      setSearchTerm("")
      setCustomInput("")
    }
  }, [show, selectedItemIds, selectedCustomItems, day, mealMeta])

  const filteredMenus = useMemo(() => {
    return restaurantMenus.filter((m) =>
      m.dish?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [restaurantMenus, searchTerm])

  if (!show) return null

  const toggleItem = (menuId) => {
    setChosenIds((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId]
    )
  }

  const addCustomItem = (e) => {
    e.preventDefault()
    const trimmed = customInput.trim()
    if (!trimmed) return
    if (!customList.includes(trimmed)) {
      setCustomList((prev) => [...prev, trimmed])
    }
    setCustomInput("")
  }

  const removeCustomItem = (name) => {
    setCustomList((prev) => prev.filter((item) => item !== name))
  }

  const handleSave = () => {
    onSave(chosenIds, customList)
    onClose()
  }

  return (
    <div className="item-picker-modal-backdrop" onClick={onClose}>
      <div
        className="item-picker-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="item-picker-header">
          <div>
            <h4 className="text-white fw-bold mb-0">
              {mealMeta?.icon} Select Dishes for {day} {mealMeta?.label}
            </h4>
            <span className="text-secondary small">
              Link existing menu dishes or add custom daily specials
            </span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="item-picker-body">
          {/* Custom Dish Quick-Add Form */}
          <div className="mb-4">
            <label className="text-warning fw-semibold small mb-1">
              ✨ Add Custom / Special Item (e.g. "Poha + Masala Chai")
            </label>
            <form onSubmit={addCustomItem} className="d-flex gap-2">
              <input
                type="text"
                className="form-control form-control-sm bg-dark text-light border-secondary"
                placeholder="Type dish name and click Add..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
              />
              <button type="submit" className="btn btn-sm btn-warning fw-bold">
                + Add
              </button>
            </form>

            {customList.length > 0 && (
              <div className="mt-2">
                {customList.map((item, idx) => (
                  <span key={idx} className="custom-item-tag">
                    {item}
                    <button
                      type="button"
                      onClick={() => removeCustomItem(item)}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <hr className="border-secondary opacity-25" />

          {/* Existing Menu Items Selection */}
          <div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="text-light fw-semibold small">
                📋 Pick from Restaurant Menu Items ({chosenIds.length} selected)
              </label>
            </div>

            <input
              type="text"
              className="form-control form-control-sm bg-dark text-light border-secondary mb-3"
              placeholder="🔍 Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {restaurantMenus.length === 0 ? (
              <div className="text-center text-secondary py-3 small">
                No menu items created for this restaurant yet. Use the Custom Item
                input above or add menu items in Menu Manager.
              </div>
            ) : filteredMenus.length === 0 ? (
              <div className="text-center text-secondary py-3 small">
                No menu items matched "{searchTerm}".
              </div>
            ) : (
              <div style={{ maxHeight: "240px", overflowY: "auto" }}>
                {filteredMenus.map((item) => {
                  const isSelected = chosenIds.includes(item._id)
                  return (
                    <div
                      key={item._id}
                      className={`menu-item-selectable-row ${isSelected ? "selected" : ""
                        }`}
                      onClick={() => toggleItem(item._id)}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-check-input mt-0"
                          checked={isSelected}
                          onChange={() => { }}
                        />
                        <span className="text-light fw-medium">
                          {item.dish}
                        </span>
                        {item.category && (
                          <span className="badge bg-secondary text-light small px-2 py-0">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <span className="text-warning fw-bold small">
                        ₹{item.price}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="item-picker-footer">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm px-3"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-warning btn-sm px-4 fw-bold text-dark"
            onClick={handleSave}
          >
            ✓ Done
          </button>
        </div>
      </div>
    </div>
  )
}

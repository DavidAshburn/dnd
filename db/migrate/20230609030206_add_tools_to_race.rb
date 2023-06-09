class AddToolsToRace < ActiveRecord::Migration[7.0]
  def change
    add_column :races, :tools, :string, array: true, default: []
  end
end
